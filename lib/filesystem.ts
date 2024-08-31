// Imports
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';


// Function to check if a file exists
function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}


// Function to read a file and return its content as a trimmed string
function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8').toString().trim();
}


// Function to write a string to a file
function writeFile(filePath: string, dataStr: string): void {
  fs.writeFileSync(filePath, dataStr + '\n');
}


// Function to create a temporary directory
function createTmpDir(): string {
  const tmpDir = os.tmpdir();
  const prefix = 'CardanoCLIWrapper-';
  const tmpDirectory = fs.mkdtempSync(path.join(tmpDir, prefix));
  return tmpDirectory;
}


// Function to delete a directory recursively
function deleteDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    const msg = `Directory not found: ${dirPath}`;
    throw new Error(msg);
  }
  fs.rmSync(dirPath, { recursive: true, force: true });
}


// Function to read a file and return its content as an array of lines
function readFileLines(filePath: string): string[] {
  return readFile(filePath).split('\n');
}


// Function to read a file and parse its content as JSON
function readFileJson(filePath: string): any {
  return JSON.parse(readFile(filePath));
}


// Function to write an object as JSON to a file
function writeFileJson(filePath: string, data: any): void {
  writeFile(filePath, JSON.stringify(data, null, 4));
}


// Export the functions
export default {
  fileExists,
  readFile,
  writeFile,
  createTmpDir,
  deleteDir,
  readFileLines,
  readFileJson,
  writeFileJson,
};
