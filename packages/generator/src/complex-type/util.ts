import { VdmProperty } from '../vdm-types';
/* eslint-disable valid-jsdoc */

/**
 * @internal
 */
export function hasEdmTypeProperty(properties: VdmProperty[]): boolean {
  return properties.some(prop => !prop.isComplex && !prop.isEnum);
}
/**
 * @internal
 */
export function hasComplexTypeProperty(properties: VdmProperty[]): boolean {
  return properties.find(prop => prop.isComplex === true) !== undefined;
}
