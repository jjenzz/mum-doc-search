const docx = require('docx');
const PDFParser = require('pdf2json');
const fs = require('fs');

const directory = process.argv[2];
const firstTerm = process.argv[3];
const secondTerm = process.argv[4];
const writeTo = process.argv[5];
const styles = new docx.Styles();

styles
	.createParagraphStyle('Heading1', 'Heading 1')
	.basedOn('Normal')
	.next('Paragraph')
	.quickFormat()
	.size(30)
	.bold()
	.spacing({ after: 120 });

function findText(first, second, content = '') {
	const regex = new RegExp(`${first}[^]*?${second}`, 'g');
	const match = content.match(regex);

	if (match) {
		return match.map(str => str.trim().replace(`${second}`, ''));
	}

	return null;
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

function writeToDoc(doc, title, matches) {
	doc.createParagraph(title).heading1();

	matches.forEach(match => {
		doc.createParagraph(match);
		doc.createParagraph().thematicBreak();
		doc.createParagraph().thematicBreak();
	});

	doc.createParagraph().pageBreak();
}

fs.readdir(directory, (_, items) => {
	const generated = [];
	const pdfs = items.filter(item => item.match(/\.pdf$/));
	const outPath = `${writeTo}/${firstTerm}.docx`;
	const doc = new docx.Document({
		title: firstTerm
	});

	pdfs.forEach(filename => {
		const path = `${directory}/${filename}`;

		readFile(path, content => {
			const matches = findText(firstTerm, secondTerm, content);

			generated.push(path);

			if (matches) {
				writeToDoc(doc, path, matches);
			}

			if (generated.length === pdfs.length) {
				const exporter = new docx.LocalPacker(doc, styles);
				exporter.pack(outPath);
			}
		});
	});
});
