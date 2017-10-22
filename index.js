const officegen = require('officegen');
const PDFParser = require('pdf2json');
const fs = require('fs');

const directory = process.argv[2];
const term = process.argv[3];
const writeTo = process.argv[4];
const chars = process.argv[5] || 400;

function findText(term, content = '') {
	const regex = new RegExp(
		`\\b[\\s\\S]{0,${chars}}\\b${term}\\b\\b[\\s\\S]{0,${chars}}`,
		'gi'
	);
	return [...content.match(regex)].map(str => str.trim());
}

function readFile(path, cb) {
	const pdfParser = new PDFParser(this, 1);

	pdfParser.on('pdfParser_dataError', errData => {
		console.log(errData.parseError);
	});

	pdfParser.on('pdfParser_dataReady', pdfData => {
		cb(pdfParser.getRawTextContent());
	});

	pdfParser.loadPDF(path);
}

function writeToDoc(doc, title, lines) {
	doc.createP().addText(title, { bold: true, font_size: 30 });

	lines.forEach(line => {
		const p = doc.createP();
		p.addText(line);
		p.addHorizontalLine();
	});

	doc.putPageBreak();
}

fs.readdir(directory, (_, items) => {
	const generated = [];
	const pdfs = items.filter(item => item.match(/\.pdf$/));
	const outPath = `${writeTo}/${term}.docx`;
	const out = fs.createWriteStream(outPath);
	const doc = officegen({
		type: 'docx',
		orientation: 'portrait',
		title: term,
		keywords: term
	});

	doc.on('finalize', () => {
		console.log(`Created ${outPath}`);
	});

	doc.on('error', function(err) {
		console.log(err);
	});

	pdfs.forEach(filename => {
		const path = `${directory}/${filename}`;

		readFile(path, content => {
			const matches = findText(term, content);

			generated.push(path);

			if (matches) {
				writeToDoc(doc, path, matches);
			}

			if (generated.length === pdfs.length) {
				doc.generate(out);
			}
		});
	});
});
