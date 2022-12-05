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

define(['N/search', 'N/log', './BR_LIB_Item_Costing'],

    /**
     * @return {{
     *   onAction: Function,
     * }}
     */
    function (searchModule, logModule, itemCostingLibrary) {

        /**
         * @param {OnActionContext} context
         * @return {void}
         */
        function onAction(context) {
            try {

                var record = context.newRecord;

                var itemASIN = record.getValue({fieldId: 'custrecord_br_adcost_item_asin'});

            logModule.debug({title: 'Item ASIN', details: itemASIN});

                var itemSearch = searchModule.create({
                    type: "inventoryitem",
                    filters:
                        [
                            ["type","anyof","InvtPart"],
                            "AND",
                            ["isinactive","is","F"],
                            "AND",
                            ["custitem_fa_amz_asin","is", itemASIN],
                            "AND",
                            ["nameinternal","doesnotstartwith","R"]
                        ],
                    columns:
                        [
                            searchModule.createColumn({name: "internalid"}),
                        ]
                });
                var resultSet = itemSearch.run();
                    var firstResult = resultSet.getRange({
                        start: 0,
                        end: 1
                    }) [0];

                    var itemId = firstResult.getValue({name: 'internalid'});
                logModule.debug ({title: 'Internal ID', details: itemId});


                var itemInformationMapping = itemCostingLibrary.itemInformationSearch(itemId);

                var itemInformation = itemInformationMapping[itemId];
                    var itemUPC = itemInformation.itemUPC;
                    var itemDescription = itemInformation.itemDescription;
                    var itemCategory = itemInformation.itemCategory;
                    var itemCategoryId = itemInformation.itemCategoryId;
                    var itemFamily = itemInformation.itemFamily;
                    var itemFamilyId = itemInformation.itemFamilyId;
                    var productStatus = itemInformation.productStatus;

                logModule.debug({title: 'Category', details: itemCategory});
                logModule.debug({title: 'Category ID', details: itemCategoryId});
                logModule.debug({title: 'Family', details: itemFamily});
                logModule.debug({title: 'Family ID', details: itemFamilyId});

                //set field values
                record.setValue({fieldId: 'custrecord_br_adcost_item_name', value: itemId});
                record.setValue({fieldId: 'custrecord_br_adcost_item_upc', value: itemUPC});
                record.setValue({fieldId: 'custrecord_br_adcost_item_description', value: itemDescription});
                record.setValue({fieldId: 'custrecord_br_adcost_item_category', value: itemCategoryId});
                record.setValue({fieldId: 'custrecord_br_adcost_item_family', value: itemFamilyId});
                record.setValue({fieldId: 'custrecord_br_adcost_product_status', value: productStatus});


            } catch (e) {
                logModule.error('onAction', JSON.parse(JSON.stringify(e)));
            }
        }

        return {
            onAction: onAction,
        };

    }
);