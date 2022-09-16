/**
 * @NApiVersion 2.x
 * @NModuleScope SameAccount
 * @NScriptType WorkflowActionScript
 * @see https://system.netsuite.com/app/help/helpcenter.nl?fid=section_4460429314.html
 */

/**
 * Created by: Mark Chuberka
 * Date Created: 2022-04-12
 * Last Update: 2022-04-12
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
                const transferCost = context.newRecord;

                //initialize total of all lane costs in sublist
                var totalCost = 0;
                //get number of lanes associated with Transfer Cost record
                var laneCount = transferCost.getLineCount('recmachcustrecord_br_lane_transfer_cost');

            log.debug ({ title: 'Lane Count', details: laneCount});

                //loop through sublist and add the weighted lane costs to the total lane costs
                for (var i = 0; i < laneCount; i++) {
                    laneCost = transferCost.getSublistValue({
                        sublistId:'recmachcustrecord_br_lane_transfer_cost',
                        fieldId: 'custrecord_br_transfer_lane_weighted_cst',
                        line: i
                    })
            log.debug ({title: 'Lane Cost: ', details: 'Lane: ' + i + ' cost: ' + laneCost});

                    totalCost += parseFloat(laneCost);
                }

            log.debug ({title: 'Total of Lane Costs:', details: totalCost});

                //set the Transfer cost field to the total of weighted lane costs.
                transferCost.setValue({
                    fieldId: 'custrecord_br_transfer_cost_lane_cost',
                    value: totalCost
                });

            } catch (e) {
                log.error('onAction', JSON.parse(JSON.stringify(e)));
            }
        }
        exports.onAction = onAction;
        return exports;

    }
);