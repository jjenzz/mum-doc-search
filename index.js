const findInFiles = require('find-in-files');
const officegen = require('officegen');
const fs = require('fs');

const directory = process.argv[2];
const term = process.argv[3];
const writeTo = process.argv[4];

function reducePayload(payload) {
	return Object.keys(payload).map(file => ({
		file,
		lines: payload[file].line
	}));
}

function writeMatch(doc, match) {
	doc.createP().addText(match.file, { bold: true, font_size: 30 });

	match.lines.forEach(line => {
		doc.createP().addText(line);
	});
}

findInFiles
	.find({ term: `\\b${term}`, flags: 'ig' }, directory)
	.then(reducePayload)
	.then(results => {
		const path = `${writeTo}/${term}.docx`;
		const out = fs.createWriteStream(path);
		const doc = officegen({
			type: 'docx',
			orientation: 'portrait',
			title: term,
			keywords: term
		});

		doc.on('finalize', () => {
			console.log(`Created ${path}`);
		});

		doc.on('error', function(err) {
			console.log(err);
		});

		results.forEach(writeMatch.bind(null, doc));
		doc.generate(out);
	});
