/**
 * @NApiVersion 2.x
 * @NModuleScope SameAccount
 * @NScriptType WorkflowActionScript
 * @see https://system.netsuite.com/app/help/helpcenter.nl?fid=section_4460429314.html
 */

/**
 * Created by: Mark Chuberka
 * Date Created: 2022-04-15
 * Last Update: 2022-04-18
 * Version 0.9
 */

define([],

    /**
     * @return {{
     *   onAction: Function,
     * }}
     */
    function () {
        /**
         * @param {OnActionContext} context
         * @return {void}
         */

        const exports = {};

        function onAction(context) {
            try {
                const soldCost = context.newRecord;

                //initialize total of all processing fee records in sublist
                var totalPercent = 0;
                var totalPerUnit = 0;
                //get number of records associated with processing fee records
                var processingCount = soldCost.getLineCount('recmachcustrecord_br_processing_sold_costs');

            log.debug ({ title: 'Processing Count', details: processingCount});

                //loop through sublist and add the weighted percent, per unit, and other charges to the total weighted values
                for (var i = 0; i < processingCount; i++) {
                    processingPct = soldCost.getSublistValue({
                        sublistId:'recmachcustrecord_br_processing_sold_costs',
                        fieldId: 'custrecord_br_processing_weighted_pct',
                        line: i
                    })
                    log.debug ({title: 'Processing Percent: ', details: i + ' percent: ' + processingPct});
                    totalPercent += parseFloat(processingPct);

                    //add per unit costs
                    processingPerUnit = soldCost.getSublistValue({
                        sublistId:'recmachcustrecord_br_processing_sold_costs',
                        fieldId: 'custrecord_br_processing_weighted_per',
                        line: i
                    })
                    log.debug ({title: 'Processing per Unit: ', details: i + ' per Unit: ' + processingPerUnit});
                    totalPerUnit += parseFloat(processingPerUnit);
                }

                log.debug ({title: 'Total percentages:', details: totalPercent});
                log.debug ({title: 'Total per Unit:', details: totalPerUnit});

                //set the totals fields to the total of weighted values.
                soldCost.setValue({
                    fieldId: 'custrecord_br_soldcost_process_fee_pct',
                    value: totalPercent
                });

                soldCost.setValue({
                    fieldId: 'custrecord_br_soldcost_process_per_unit',
                    value: totalPerUnit.toFixed(5)
                });

            } catch (e) {
                log.error('onAction', JSON.parse(JSON.stringify(e)));
            }
        }
        exports.onAction = onAction;
        return exports;

    }
);