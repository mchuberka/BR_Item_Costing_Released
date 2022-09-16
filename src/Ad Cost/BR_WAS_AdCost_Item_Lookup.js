/**
 * @NApiVersion 2.x
 * @NModuleScope SameAccount
 * @NScriptType WorkflowActionScript
 * @see https://system.netsuite.com/app/help/helpcenter.nl?fid=section_4460429314.html
 */

/**
 * Created by: Mark Chuberka
 * Date Created: 2022-09-15
 * Last Update: 2022-09-15
 * Version 0.1
 */

define(['N/search', 'N/log'],

    /**
     * @return {{
     *   onAction: Function,
     * }}
     */
    function (search, log) {

        /**
         * @param {OnActionContext} context
         * @return {void}
         */
        function onAction(context) {
            try {

                var record = context.newRecord;

                var itemASIN = record.getValue({fieldId: 'custrecord_br_adcost_item_asin'});

            log.debug({title: 'Item ASIN', details: itemASIN});

                var itemSearch = search.create({
                    type: "inventoryitem",
                    filters:
                        [
                            ["type","anyof","InvtPart"],
                            "AND",
                            ["isinactive","is","F"],
                            "AND",
                            ["custitem_fa_amz_asin","anyof",itemASIN]
                        ],
                    columns:
                        [
                            search.createColumn({name: "internalid"}),
                        ]
                });
                var resultSet = itemSearch.run();
                    var firstResult = resultSet.getRange({
                        start: 0,
                        end: 1
                    }) [0];

                    var itemId = firstResult.getValue({name: 'internalid'});
                log.debug ({title: 'Internal ID', details: itemId});


                var itemInformationMapping = itemCostingLibrary.itemInformationSearch(itemId);

                var itemInformation = itemInformationMapping[itemId];
                    var itemName = itemInformation.itemName;
                    var itemUPC = itemInformation.itemUPC;
                    var itemDescription = itemInformation.itemDescription;
                    var itemCategory = itemInformation.itemCategory;
                    var itemFamily = itemInformation.itemFamily;
                    var productStatus = itemInformation.productStatus;

                logModule.debug({title: 'Item', details: itemName});
                logModule.debug({title: 'Category', details: itemCategory});

                //set field values
                rec.setValue({fieldId: 'custrecord_br_adcost_item_name', value: itemName});
                rec.setValue({fieldId: 'custrecord_br_adcost_item_upc', value: itemUPC});
                rec.setValue({fieldId: 'custrecord_br_adcost_item_description', value: itemDescription});
                rec.setValue({fieldId: 'custrecord_br_adcost_item_category', value: itemCategory});
                rec.setValue({fieldId: 'custrecord_br_adcost_item_family', value: itemFamily});
                rec.setValue({fieldId: 'custrecord_br_adcost_product_status', value: productStatus});


            } catch (e) {
                log.error('onAction', JSON.parse(JSON.stringify(e)));
            }
        }

        return {
            onAction: onAction,
        };

    }
);