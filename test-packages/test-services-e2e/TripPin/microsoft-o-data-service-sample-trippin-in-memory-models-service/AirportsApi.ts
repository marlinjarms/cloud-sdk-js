/*
 * Copyright (c) 2022 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { Airports } from './Airports';
import { AirportsRequestBuilder } from './AirportsRequestBuilder';
import { AirportLocation, AirportLocationField } from './AirportLocation';
import {
  CustomField,
  defaultDeSerializers,
  DefaultDeSerializers,
  DeSerializers,
  mergeDefaultDeSerializersWith,
  AllFields,
  entityBuilder,
  EntityBuilderType,
  EntityApi,
  FieldBuilder,
  Time,
  EdmTypeField
} from '@sap-cloud-sdk/odata-v4';
import { BigNumber } from 'bignumber.js';
import { Moment, Duration } from 'moment';
export class AirportsApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers
> implements EntityApi<Airports<DeSerializersT>, DeSerializersT>
{
  public deSerializers: DeSerializersT;

  constructor(deSerializers: DeSerializersT = defaultDeSerializers as any) {
    this.deSerializers = deSerializers;
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = Airports;

  requestBuilder(): AirportsRequestBuilder<DeSerializersT> {
    return new AirportsRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<Airports<DeSerializersT>, DeSerializersT> {
    return entityBuilder(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT
  ): CustomField<Airports<DeSerializersT>, DeSerializersT, NullableT> {
    return new CustomField(
      fieldName,
      this.entityConstructor,
      this.deSerializers,
      isNullable
    ) as any;
  }

  get schema() {
    const fieldBuilder = new FieldBuilder(Airports, this.deSerializers);
    return {
      /**
       * Static representation of the [[icaoCode]] property for query construction.
       * Use to reference this property in query operations such as 'select' in the fluent request API.
       */
      ICAO_CODE: fieldBuilder.buildEdmTypeField(
        'IcaoCode',
        'Edm.String',
        false
      ),
      /**
       * Static representation of the [[name]] property for query construction.
       * Use to reference this property in query operations such as 'select' in the fluent request API.
       */
      NAME: fieldBuilder.buildEdmTypeField('Name', 'Edm.String', false),
      /**
       * Static representation of the [[iataCode]] property for query construction.
       * Use to reference this property in query operations such as 'select' in the fluent request API.
       */
      IATA_CODE: fieldBuilder.buildEdmTypeField(
        'IataCode',
        'Edm.String',
        false
      ),
      /**
       * Static representation of the [[location]] property for query construction.
       * Use to reference this property in query operations such as 'select' in the fluent request API.
       */
      LOCATION: fieldBuilder.buildComplexTypeField(
        'Location',
        AirportLocationField,
        false
      ),
      ...this.navigationPropertyFields,
      /**
       *
       * All fields selector.
       */
      ALL_FIELDS: new AllFields('*', Airports)
    };
  }
}
