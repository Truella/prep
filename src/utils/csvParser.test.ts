import { describe, it, expect } from "vitest";
import { parseAndValidateCSV } from "./csvParser";

const makeFile = (content: string) =>
	new File([content], "test.csv", { type: "text/csv" });

const VALID_CSV = `Question,Option_A,Option_B,Option_C,Option_D,Correct_Answer,Points
What is 2+2?,1,2,3,4,D,1
Capital of France?,Berlin,Paris,Rome,Madrid,B,2`;

describe("parseAndValidateCSV", () => {
	it("parses a valid CSV successfully", async () => {
		const result = await parseAndValidateCSV(makeFile(VALID_CSV));
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toHaveLength(2);
		}
	});

	it("accepts lowercase correct answer", async () => {
		const csv = VALID_CSV.replace(",D,", ",d,");
		const result = await parseAndValidateCSV(makeFile(csv));
		expect(result.success).toBe(true);
	});

	it("accepts whitespace-padded correct answer", async () => {
		const csv = VALID_CSV.replace(",D,", ", B ,");
		const result = await parseAndValidateCSV(makeFile(csv));
		expect(result.success).toBe(true);
	});

	it("rejects an invalid correct answer", async () => {
		const csv = VALID_CSV.replace(",D,", ",E,");
		const result = await parseAndValidateCSV(makeFile(csv));
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.message).toContain("Row 1");
		}
	});

	it("rejects a CSV missing required columns", async () => {
		const csv = `Question,Option_A,Option_B,Option_C,Option_D
What is 2+2?,1,2,3,4`;
		const result = await parseAndValidateCSV(makeFile(csv));
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.message).toBe("CSV is missing required columns.");
		}
	});

	it("rejects an empty file", async () => {
		const result = await parseAndValidateCSV(makeFile(""));
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.message).toBe("No data found in CSV.");
		}
	});

	it("rejects a malformed CSV with parse errors", async () => {
		const csv = `Question,Option_A
a,b,c`;
		const result = await parseAndValidateCSV(makeFile(csv));
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.message).toBe("CSV contains parsing errors.");
		}
	});

	it("rejects a row with missing question text", async () => {
		const csv = `Question,Option_A,Option_B,Option_C,Option_D,Correct_Answer,Points
,1,2,3,4,D,1`;
		const result = await parseAndValidateCSV(makeFile(csv));
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.message).toContain("Row");
		}
	});

	it("accepts options with leading/trailing whitespace without failing", async () => {
		const csv = `Question,Option_A,Option_B,Option_C,Option_D,Correct_Answer,Points
What is 2+2?, 1 , 2 , 3 , 4 ,D,1`;
		const result = await parseAndValidateCSV(makeFile(csv));
		expect(result.success).toBe(true);
	});
});
