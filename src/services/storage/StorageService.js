const fs = require('fs');

class StorageService {
  constructor(directory) {
    this._directory = directory;

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }

  writeFile(file, meta) {
    const filename = `${Date.now()}${meta.filename}`;
    const filePath = `${this._directory}/${filename}`;

    const fileStream = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));

      file.on('error', (error) => {
        fileStream.end();
        fileStream.close();
        reject(error);
      });

      file.on('end', () => {
        resolve(filename);
      });

      file.pipe(fileStream);
    });
  }
}

module.exports = { StorageService };
