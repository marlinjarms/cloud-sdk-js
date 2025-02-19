import { SourceFileStructure, StructureKind } from 'ts-morph';
import { VdmEntity, VdmServiceMetadata } from '../vdm-types';
import { entityClass } from './class';
import { classValidatorImport, entityImportDeclarations, otherEntityImports } from './imports';
import { entityTypeInterface } from './interface';

// eslint-disable-next-line valid-jsdoc
/**
 * @internal
 */
export function entitySourceFile(
  entity: VdmEntity,
  service: VdmServiceMetadata
): SourceFileStructure {
  return {
    kind: StructureKind.SourceFile,
    statements: [
      ...entityImportDeclarations(entity, service.oDataVersion),
      ...otherEntityImports(entity, service),
      classValidatorImport(),
      entityClass(entity, service),
      entityTypeInterface(entity, service)
    ]
  };
}
