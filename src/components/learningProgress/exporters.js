import { LEVEL_LABEL, classLabel, placeName, titleCase, unitWord } from "./lpTheme";

// Downloads for the Learning Progress report. Everything is built from the report the page already
// has, so a file always matches the filters on screen. No children's names are in the report.

const slug = (s) => String(s || "").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "");

export const fileBase = (data) => {
	const place = data.place?.level === "school" ? data.place.school?.udise : placeName(data.place).replace(/ (block|cluster|district)$/, "");
	const what = data.view === "fln" ? `FLN_${data.from || ""}-${data.to || ""}` : data.test;
	return [slug(place), slug(what), slug(data.year)].filter(Boolean).join("_");
};

const levelName = (l) => LEVEL_LABEL[l] || l;
const gradeOf = (s) => (s && !s.hidden ? s.grade ?? "" : s?.hidden ? "hidden" : "");
const num = (v) => (v == null ? "" : v);

// Sheets for the class-tests view
function testSheets(data) {
	const now = data.summary?.now || {};
	const sheets = [{
		name: "Summary",
		columns: [{ header: "Item", width: 34 }, { header: "Value", width: 40 }],
		rows: [
			["Place", placeName(data.place)],
			["Academic year", data.year],
			["Test", data.testLabel || data.test],
			["Classes", classLabel(data.classes)],
			["Subject", data.subject === "all" ? "All subjects" : data.subject],
			["Grade", now.grade ?? ""],
			["Grade points (of 4)", num(now.points)],
			["Average score %", num(now.avgPct)],
			["Passed (33% or more) %", num(now.passPct)],
			["Children assessed", num(now.present)],
			["Schools that entered marks", data.summary?.eligible ? `${data.summary.entered} of ${data.summary.eligible}` : num(data.summary?.entered)],
			["Previous test", data.summary?.prevTag || ""],
			["Previous grade", data.summary?.prev?.grade ?? ""],
			["Previous average %", num(data.summary?.prev?.avgPct)],
			["Generated", new Date(data.generatedAt).toLocaleString("en-IN")],
		],
	}];
	const subjects = data.matrix?.subjects || [];
	sheets.push({
		name: "Class x subject",
		columns: [{ header: "Class", width: 10 }, ...subjects.flatMap((s) => [{ header: `${s} grade`, width: 12 }, { header: `${s} average %`, width: 14 }]), { header: "Class grade", width: 12 }, { header: "Class average %", width: 15 }],
		rows: (data.matrix?.rows || []).map((r) => [
			`Class ${r.cls}`,
			...subjects.flatMap((s) => [gradeOf(r.cells[s]), num(r.cells[s]?.avgPct)]),
			gradeOf(r.total), num(r.total?.avgPct),
		]),
	});
	sheets.push({
		name: "Compare tests",
		columns: [{ header: "Test", width: 20 }, { header: "All subjects average %", width: 22 }, ...subjects.map((s) => ({ header: `${s} %`, width: 12 }))],
		rows: (data.compareTests || []).map((c) => [c.label, num(c.overall?.avgPct), ...subjects.map((s) => num(c.subjects?.[s]?.avgPct))]),
	});
	if (data.compareBy) sheets.push(unitSheet(data));
	if (data.pending) sheets.push(pendingSheet(data));
	return sheets;
}

export function unitSheet(data) {
	const level = data.compareBy;
	const isSchool = level === "school";
	return {
		name: unitWord[level][1],
		columns: [
			{ header: unitWord[level][0], width: 36 },
			...(isSchool ? [{ header: "UDISE", width: 14 }, { header: "Block", width: 14 }, { header: "Cluster", width: 18 }] : level === "cluster" ? [{ header: "Block", width: 14 }] : []),
			{ header: "Grade", width: 8 }, { header: "Grade points", width: 12 }, { header: "Average %", width: 11 }, { header: "Passed %", width: 10 },
			{ header: "Children", width: 10 }, { header: isSchool ? "Class-subjects entered" : "Schools entered", width: 18 }, { header: isSchool ? "Class-subjects due" : "Schools due", width: 14 },
			{ header: `Average % in ${data.summary?.prevTag || "previous test"}`, width: 22 },
		],
		rows: (data.units || []).map((u) => [
			isSchool ? u.name : titleCase(u.name),
			...(isSchool ? [u.udise, titleCase(u.block), titleCase(u.cluster)] : level === "cluster" ? [titleCase(u.block)] : []),
			gradeOf(u.now), num(u.now?.points), num(u.now?.avgPct), num(u.now?.passPct), num(u.now?.present),
			isSchool ? num(u.marks?.entered) : num(u.entered), isSchool ? num(u.marks?.due) : num(u.eligible),
			num(u.prev?.avgPct),
		]),
	};
}

export function pendingSheet(data) {
	return {
		name: "Marks not entered",
		columns: [{ header: "School", width: 38 }, { header: "UDISE", width: 14 }, { header: "Block", width: 14 }, { header: "Cluster", width: 18 }, { header: "Missing", width: 10 }, { header: "Due", width: 8 }, { header: "Class and subject still to enter", width: 60 }],
		rows: (data.pending?.schools || []).map((s) => [s.name, s.udise, titleCase(s.block), titleCase(s.cluster), s.missing.length, s.due, s.missing.map((m) => `Class ${m.cls} ${m.subject}`).join(", ")]),
	};
}

// Sheets for the reading and maths levels view
function flnSheets(data) {
	const sheets = [{
		name: "Levels",
		columns: [{ header: "Subject", width: 10 }, { header: "Test", width: 12 }, { header: "Level", width: 18 }, { header: "Children", width: 10 }, { header: "Share %", width: 10 }, { header: "Subject grade", width: 13 }, { header: "Average level", width: 13 }],
		rows: (data.subjects || []).flatMap((s) => [["from", data.from], ["to", data.to]].filter(([, tag]) => tag).flatMap(([side, tag]) => {
			const st = s[side];
			if (!st || st.hidden) return [[s.subject, tag, "", "", "", gradeOf(st), ""]];
			return s.levels.map((l) => [s.subject, tag, levelName(l), st.counts[l], st.shares[l], st.grade, st.avgLevel]);
		})),
	}];
	sheets.push({
		name: "By class",
		columns: [{ header: "Class", width: 10 }, ...["Hindi", "English", "Maths"].flatMap((s) => [{ header: `${s} ${data.from || ""}`, width: 14 }, { header: `${s} ${data.to || ""}`, width: 14 }, { header: `${s} top two levels %`, width: 20 }])],
		rows: (data.byClass || []).map((c) => [`Class ${c.cls}`, ...["Hindi", "English", "Maths"].flatMap((s) => [gradeOf(c.subjects[s]?.from), gradeOf(c.subjects[s]?.to), num(c.subjects[s]?.to?.topSharePct)])]),
	});
	if (data.compareBy) {
		const isSchool = data.compareBy === "school";
		sheets.push({
			name: unitWord[data.compareBy][1],
			columns: [{ header: unitWord[data.compareBy][0], width: 36 }, ...(isSchool ? [{ header: "UDISE", width: 14 }] : []), ...["Hindi", "English", "Maths"].flatMap((s) => [{ header: `${s} ${data.from || ""}`, width: 14 }, { header: `${s} ${data.to || ""}`, width: 14 }, { header: `${s} children`, width: 12 }])],
			rows: (data.units || []).map((u) => [isSchool ? u.name : titleCase(u.name), ...(isSchool ? [u.udise] : []), ...["Hindi", "English", "Maths"].flatMap((s) => [gradeOf(u.subjects[s]?.from), gradeOf(u.subjects[s]?.to), num(u.subjects[s]?.to?.present)])]),
		});
	}
	return sheets;
}

export const reportSheets = (data) => (data.view === "fln" ? flnSheets(data) : testSheets(data));

function save(blob, name) {
	const url = URL.createObjectURL(blob);
	const a = Object.assign(document.createElement("a"), { href: url, download: name });
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadCsv(sheet, name) {
	const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
	const lines = [sheet.columns.map((c) => esc(c.header)).join(","), ...sheet.rows.map((r) => r.map(esc).join(","))];
	// BOM so Excel opens Hindi level names correctly
	save(new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" }), `${name}.csv`);
}

export async function downloadExcel(sheets, name) {
	const { default: ExcelJS } = await import("exceljs");
	const book = new ExcelJS.Workbook();
	book.creator = "PDLD";
	for (const sheet of sheets) {
		const ws = book.addWorksheet(sheet.name.slice(0, 31), { views: [{ state: "frozen", ySplit: 1 }] });
		ws.columns = sheet.columns.map((c) => ({ header: c.header, width: c.width || 14 }));
		ws.getRow(1).eachCell((cell) => {
			cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
			cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2F4F4F" } };
			cell.alignment = { vertical: "middle", wrapText: true };
		});
		sheet.rows.forEach((r) => ws.addRow(r));
	}
	const buffer = await book.xlsx.writeBuffer();
	save(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${name}.xlsx`);
}
