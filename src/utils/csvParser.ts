import Papa, { ParseResult } from "papaparse";
import type { MCQRow } from "../lib/types";

type CSVResult =
	| { success: true; data: MCQRow[] }
	| { success: false; message: string };

export function parseAndValidateCSV(file: File): Promise<CSVResult> {
	return new Promise((resolve, reject) => {
		Papa.parse<MCQRow>(file, {
			header: true,
			skipEmptyLines: true,

			complete: (results: ParseResult<MCQRow>) => {
				/* Empty file */
				if (!results.data || results.data.length === 0) {
					resolve({
						success: false,
						message: "No data found in CSV.",
					});
					return;
				}

				/* Parse errors */
				if (results.errors.length > 0) {
					resolve({
						success: false,
						message: "No data found in CSV.",
					});
					return;
				}

				/* Header validation */
				const requiredFields: (keyof MCQRow)[] = [
					"Question",
					"Option_A",
					"Option_B",
					"Option_C",
					"Option_D",
					"Correct_Answer",
				];

				const fields = results.meta.fields as (keyof MCQRow)[] | undefined;

				if (!fields || !requiredFields.every((f) => fields.includes(f))) {
					resolve({
						success: false,
						message: "CSV is missing required columns.",
					});
					return;
				}

				/* Row validation */
				for (let i = 0; i < results.data.length; i++) {
					const row = results.data[i];

				if (
					!row.Question?.trim() ||
					!row.Option_A?.trim() ||
					!row.Option_B?.trim() ||
					!row.Option_C?.trim() ||
					!row.Option_D?.trim() ||
					!row.Correct_Answer?.trim()
				) {
						resolve({
							success: false,
							message: `Row ${i + 1} has missing values.`,
						});
						return;
					}

					const answer = row.Correct_Answer?.trim().toUpperCase();
				if (!["A", "B", "C", "D"].includes(answer)) {
						resolve({
							success: false,
							message: `Row ${i + 1}: Correct_Answer must be A, B, C, or D.`,
						});
						return;
					}
				}

				resolve({
					success: true,
					data: results.data,
				});
			},

			error: (error) => {
				reject(error);
			},
		});
	});
}
