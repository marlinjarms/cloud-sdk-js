import fs = require('fs');
import edm2csn = require('@sap/edm-converters/lib/edmToCsn/lib/main');
import { VdmServiceMetadata } from '../vdm-types';

// eslint-disable-next-line valid-jsdoc
/**
 * @internal
 */
export async function csn(service: VdmServiceMetadata): Promise<string> {
  const xmlString = fs.readFileSync(service.edmxPath, 'utf8');
  return edm2csn.generateCSN(xmlString, false, true);
}
