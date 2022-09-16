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

                //initialize total of all commission records in sublist
                var totalPercent = 0;
                var totalPerUnit = 0;
                //get number of records associated with sales commission records
                var commissionCount = soldCost.getLineCount('recmachcustrecord_br_commission_sold_costs');

                log.debug ({ title: 'Commission Count', details: commissionCount});  

                //loop through sublist and add the weighted percent to the total weighted values
                for (var i = 0; i < commissionCount; i++) {
                    commissionPct = soldCost.getSublistValue({
                        sublistId:'recmachcustrecord_br_commission_sold_costs',
                        fieldId: 'custrecord_br_commission_weighted_pct',
                        line: i
                    })
                    log.debug ({title: 'Commission Percent: ', details: i + ' percent: ' + commissionPct});
                    totalPercent += parseFloat(commissionPct);

                    //add per unit costs
                    commissionPerUnit = soldCost.getSublistValue({
                        sublistId:'recmachcustrecord_br_commission_sold_costs',
                        fieldId: 'custrecord_br_commission_weighted_per',
                        line: i
                    })
                    log.debug ({title: 'Processing per Unit: ', details: i + ' per Unit: ' + commissionPerUnit});
                    totalPerUnit += parseFloat(commissionPerUnit);

                }
                log.debug ({title: 'Total percentages:', details: totalPercent});
                log.debug ({title: 'Total per Unit:', details: totalPerUnit});

                //set the totals fields to the total of weighted values.
                soldCost.setValue({
                    fieldId: 'custrecord_br_salescost_commission_pct',
                    value: totalPercent
                });

                soldCost.setValue({
                    fieldId: 'custrecord_br_soldcost_commiss_per_unit',
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