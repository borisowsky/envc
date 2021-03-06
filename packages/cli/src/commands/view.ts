import fs from 'fs';
import chalk from 'chalk';
import { decrypt } from '@senv/core';

import {
  DOTENV_FILE_PREFIX,
  ENCRYPTED_FILE_EXTENSION,
  MASTER_KEY_NAME,
} from '../config';
import {
  logger,
  withPrefix,
  withExtension,
  isFileNameValid,
  prettyPrint,
  parseDotenv,
} from '../utils';

export const view = (environment = '') => {
  try {
    isFileNameValid(environment);
  } catch (e) {
    logger.error(e.message);

    return;
  }

  const fileName = withPrefix(DOTENV_FILE_PREFIX)(environment);
  const encryptedFileName = withExtension(ENCRYPTED_FILE_EXTENSION)(fileName);
  const masterKeyFileName = withPrefix(environment)(MASTER_KEY_NAME);

  const isEncryptedFileExists = fs.existsSync(encryptedFileName);

  if (!isEncryptedFileExists) {
    logger.error(`File ${chalk.dim(encryptedFileName)} not found.`);

    return;
  }

  try {
    const publicKey = fs.readFileSync(masterKeyFileName).toString();
    const encryptedFile = fs.readFileSync(encryptedFileName).toString();
    const decrypted = decrypt(encryptedFile, publicKey);

    logger.info(`Loaded ${chalk.dim(encryptedFileName)}.`);

    if (!Boolean(decrypted)) {
      logger.warn("File exists, but it's empty.");
    } else {
      console.log('');

      prettyPrint(parseDotenv(decrypted));
    }
  } catch {
    logger.error(`Cannot find ${masterKeyFileName} master key.`);

    return;
  }
};
