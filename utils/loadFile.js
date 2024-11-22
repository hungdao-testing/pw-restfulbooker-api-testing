import fs from 'node:fs';
import path from 'node:path';

export function loadXmlFileAsText(pathToXml){
    const pathFile = path.resolve(pathToXml);
    return fs.readFileSync(pathFile, {encoding: 'utf8'}).toString()
}

export function loadJsonFile(pathToJson){
    const pathFile = path.resolve(pathToJson);
    const data = fs.readFileSync(pathFile, {encoding: 'utf8'}).toString();
    return JSON.parse(data);
}
