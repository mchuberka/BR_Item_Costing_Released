/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

/**
 * Created by: Mark Chuberka
 * Created on 2022-04-21
 * Version 0.9.1
 * Updated 2022-08-25
 */

define(['N/log', 'N/record', 'N/search', 'N/workflow'],

    function(logModule, recordModule, searchModule, workflowModule) {

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        function beforeSubmit(scriptContext) {

            var rec = scriptContext.newRecord;
            var htsCode = rec.getValue({fieldId: 'custitem_htscode'});
            var countryOfOrigin = rec.getValue({fieldId: 'custitemcountry_of_origin'});

            logModule.debug({title: 'HTS Code', details: htsCode});
            logModule.debug({title: 'Country of Origin', details: countryOfOrigin});

            searchModule.create({
                type: "customrecord_br_tariffs",
                filters:
                    [
                        ["isinactive", "is", "F"],
                        "AND",
                        ["custrecord_br_tariff_hts_code", "is", htsCode],
                        "AND",
                        ["custrecord_br_tariff_country", "anyof", countryOfOrigin]
                    ],
                columns:
                    [
                        'internalid'
                    ]
            }).run().each(function(result){
                var tariffId = result.getValue({name: 'internalid'});
                logModule.debug({title: 'Tariff ID', details: tariffId});
                rec.setValue({
                    fieldId: 'custitem_br_tariff_primary',
                    value: tariffId
                });
                return true;
            });

/*            }).run().each(processResults);

            function processResults(result) {
                var tariffId = result.getValue({name: 'internalid'});
                logModule.debug({title: 'Tariff ID', details: tariffId});
                rec.setValue({
                    fieldId: 'custitem_br_tariff_primary',
                    value: tariffId
                });
                return true;
            }*/
        }

        function afterSubmit(scriptContext){
            var rec = scriptContext.newRecord;
            var item = rec.getValue({fieldId: 'internalid'});
            logModule.debug({title: 'Item ID -RecID', details: item});

            var workflowInstanceId = workflowModule.initiate({
                recordType: 'inventoryitem',
                recordId: item,
                workflowId: 'customworkflow_br_item_tariff_total_ues'
            });
            return true;
        }

        return {beforeSubmit:beforeSubmit,
            afterSubmit: afterSubmit}

    });
