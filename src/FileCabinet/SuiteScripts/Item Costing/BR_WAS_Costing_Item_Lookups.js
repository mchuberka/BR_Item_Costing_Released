/**
 * @NApiVersion 2.x
 * @NModuleScope SameAccount
 * @NScriptType WorkflowActionScript
 * @see https://system.netsuite.com/app/help/helpcenter.nl?fid=section_4460429314.html
 */

/**
 * Created by: Mark Chuberka
 * Date Created: 2022-04-11
 * Last Update: 2022-04-27
 * Version 0.9
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

                var itemId = record.getValue({fieldId: 'custrecord_br_cost_item'});

            log.debug({title: 'Item ID', details: itemId});

                var itemSearch = search.create({
                    type: "inventoryitem",
                    filters:
                        [
                            ["type","anyof","InvtPart"],
                            "AND",
                            ["isinactive","is","F"],
                            "AND",
                            ["internalid","anyof",itemId]
                        ],
                    columns:
                        [
                            search.createColumn({name: "baseprice"}),
                            search.createColumn({name: "weight"})
                        ]
                });
                var resultSet = itemSearch.run();
                    var firstResult = resultSet.getRange({
                        start: 0,
                        end: 1
                    }) [0];

                    var basePrice = firstResult.getValue({name: 'baseprice'});
                    var itemWeight = parseFloat(firstResult.getValue({name: 'weight'}));
                log.debug ({title: 'BasePrice', details: basePrice});
                log.debug({title: 'Item Weight', details: itemWeight});

                record.setValue({fieldId: 'custrecord_br_cost_item_base_price', value: basePrice});
                record.setValue({fieldId: 'custrecord_br_cost_item_weight', value: itemWeight});

            } catch (e) {
                log.error('onAction', JSON.parse(JSON.stringify(e)));
            }
        }

        return {
            onAction: onAction,
        };

    }
);