const SURVEY_SPREADSHEET_TITLE = '活動滿意度調查';
const SURVEY_HEADERS = ['填寫者', '整體滿意度 (1-5)', '最喜歡的環節', '改進建議', '填寫時間'];
const SAMPLE_RESPONSES = [
  ['王小明', 5, '交流分享與實作演練', '維持現況就很棒！', new Date('2024-05-10T19:30:00+08:00')],
  ['陳怡君', 4, '講者內容清楚易懂', '可提前提供講義下載。', new Date('2024-05-10T19:47:00+08:00')],
  ['林志豪', 3, '互動問答', '希望增加更多實務案例。', new Date('2024-05-10T20:05:00+08:00')]
];

/**
 * Entry point for clasp run. Ensures the survey sheet exists and returns the latest summary.
 * @return {{sheetUrl: string, responseCount: number, averageSatisfaction: number, satisfiedRate: number}}
 */
function myFunction() {
  return runSurveyReport();
}

/**
 * Creates the "活動滿意度調查" spreadsheet if necessary and fills it with sample data.
 * @return {{sheetUrl: string, created: boolean, responseCount: number}}
 */
function createOrUpdateSurveySheet() {
  const context = ensureSurveySpreadsheet();
  const sheet = context.sheet;

  ensureHeaders(sheet);

  if (sheet.getLastRow() <= 1) {
    populateSampleResponses(sheet);
  }

  const responseCount = Math.max(sheet.getLastRow() - 1, 0);
  const result = {
    sheetUrl: context.spreadsheet.getUrl(),
    created: context.created,
    responseCount: responseCount
  };
  Logger.log('活動滿意度調查表已準備好：%s (共 %s 筆資料)', result.sheetUrl, result.responseCount);
  return result;
}

/**
 * Generates an aggregate report for the survey spreadsheet.
 * @return {{sheetUrl: string, responseCount: number, averageSatisfaction: number, satisfiedRate: number}}
 */
function runSurveyReport() {
  const context = ensureSurveySpreadsheet();
  const sheet = context.sheet;

  ensureHeaders(sheet);
  if (sheet.getLastRow() <= 1) {
    populateSampleResponses(sheet);
  }

  const lastRow = sheet.getLastRow();
  const responseCount = Math.max(lastRow - 1, 0);
  if (responseCount === 0) {
    const emptyResult = {
      sheetUrl: context.spreadsheet.getUrl(),
      responseCount: 0,
      averageSatisfaction: 0,
      satisfiedRate: 0
    };
    Logger.log('目前尚未有任何活動滿意度調查回覆。');
    return emptyResult;
  }

  const values = sheet.getRange(2, 1, responseCount, SURVEY_HEADERS.length).getValues();
  const numericRatings = values
    .map(function (row) {
      return Number(row[1]);
    })
    .filter(function (rating) {
      return !isNaN(rating);
    });

  const total = numericRatings.reduce(function (sum, rating) {
    return sum + rating;
  }, 0);
  const average = numericRatings.length ? total / numericRatings.length : 0;
  const satisfiedRate = numericRatings.length
    ? numericRatings.filter(function (rating) {
        return rating >= 4;
      }).length / numericRatings.length
    : 0;

  const result = {
    sheetUrl: context.spreadsheet.getUrl(),
    responseCount: responseCount,
    averageSatisfaction: Number(average.toFixed(2)),
    satisfiedRate: Number((satisfiedRate * 100).toFixed(2))
  };

  Logger.log(
    '活動滿意度調查統計：共 %s 份回覆，平均滿意度 %s 分，滿意度達標率 %s%%。',
    result.responseCount,
    result.averageSatisfaction,
    result.satisfiedRate
  );
  return result;
}

/**
 * Ensures that the 活動滿意度調查 spreadsheet exists and returns its context.
 * @return {{spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet, sheet: GoogleAppsScript.Spreadsheet.Sheet, created: boolean}}
 */
function ensureSurveySpreadsheet() {
  let spreadsheet;
  let created = false;
  const existingFiles = DriveApp.getFilesByName(SURVEY_SPREADSHEET_TITLE);
  if (existingFiles.hasNext()) {
    spreadsheet = SpreadsheetApp.open(existingFiles.next());
  } else {
    spreadsheet = SpreadsheetApp.create(SURVEY_SPREADSHEET_TITLE);
    created = true;
  }

  const sheet = spreadsheet.getSheets()[0];
  if (sheet.getName() !== SURVEY_SPREADSHEET_TITLE) {
    sheet.setName(SURVEY_SPREADSHEET_TITLE);
  }

  return { spreadsheet: spreadsheet, sheet: sheet, created: created };
}

/**
 * Writes survey headers to the sheet when they are missing or outdated.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 */
function ensureHeaders(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, SURVEY_HEADERS.length);
  const currentValues = headerRange.getDisplayValues()[0];
  const needsUpdate = SURVEY_HEADERS.some(function (header, index) {
    return currentValues[index] !== header;
  });

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(SURVEY_HEADERS);
    return;
  }

  if (needsUpdate) {
    headerRange.setValues([SURVEY_HEADERS]);
  }

  if (sheet.getLastRow() < 1) {
    sheet.getRange(1, 1, 1, SURVEY_HEADERS.length).setValues([SURVEY_HEADERS]);
  }
}

/**
 * Populates the sheet with sample responses to demonstrate the report output.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 */
function populateSampleResponses(sheet) {
  if (SAMPLE_RESPONSES.length === 0) {
    return;
  }

  sheet.getRange(2, 1, SAMPLE_RESPONSES.length, SURVEY_HEADERS.length).setValues(SAMPLE_RESPONSES);
  sheet.autoResizeColumns(1, SURVEY_HEADERS.length);
}
