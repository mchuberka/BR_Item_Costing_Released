/**
 * @NApiVersion 2.x
 * @NModuleScope SameAccount
 * @NScriptType WorkflowActionScript
 * @see https://system.netsuite.com/app/help/helpcenter.nl?fid=section_4460429314.html
 */

/**
 * Created by: Mark Chuberka
 * Date Created: 2022-05-06
 * Last Update: 2022-05-06
 * Version 0.80
 */

define(['N/search','N/record', 'N/log'],

    /**
     * @return {{
     *   onAction: Function,
     * }}
     */
    function (search,record, log) {

        //Initialize calculation variables
        //Applies to all
        var weight = 0;

        /**
         * @param {OnActionContext} context
         * @return {void}
         */
        function onAction(context) {
            try {
                var record = context.newRecord;

                //Load Item Cost Master Field Values
                var itemLength = record.getValue({fieldId: 'custrecord_br_cost_item_length'});
                var itemWidth = record.getValue({fieldId: 'custrecord_br_cost_item_width'});
                var itemHeight = record.getValue({fieldId: 'custrecord_br_cost_item_height'});
                var itemLenGirth = record.getValue({fieldId: 'custrecord_br_cost_item_length_girth'});
                var globalDefaults = record.getValue({fieldId: 'custrecord_br_cost_default_values'});
                var itemFbaDimWeight = record.getValue({fieldId: 'custrecord_br_cost_fba_dim_wt'});
                var itemActualWeight = record.getValue({fieldId: 'custrecord_br_cost_item_weight'});

                    // log.debug({title: 'item Length', details: itemLength});
                    // log.debug({title: 'item Width', details: itemWidth});
                    // log.debug({title: 'item Height', details: itemHeight});
                    // log.debug({title: 'item LenGirth', details: itemLenGirth});
                    // log.debug({title: 'globalDefaults', details: globalDefaults});
                    // log.debug({title: 'itemFbaDimWeight', details: itemFbaDimWeight});
                    // log.debug({title: 'itemActualWeight', details: itemActualWeight});


            //************************************************************
            //Search to pull values from Global Default
                // log.debug({name:'Global Default ID', details: globalDefaults});

                var defaultsRecord = search.create({
                    type: "customrecord_br_item_costing_defaults",
                    filters:
                        [
                            ["isinactive","is","F"],
                            "AND",
                            ['internalid',"is", globalDefaults]
                        ],
                    columns:
                        [
                            'custrecord_br_costdef_fba_min_dim_wt',
                            'custrecord_br_costdef_fba_max_dim_wt'
                        ]
                })
                var defaultsSearchResults = defaultsRecord.run();
                var defaultsFirstResult = defaultsSearchResults.getRange({
                    start: 0,
                    end: 1
                }) [0];

                //set Values from Global Default Record
                var fbaMinDimWeight = parseFloat(defaultsFirstResult.getValue({name: 'custrecord_br_costdef_fba_min_dim_wt'}));
                var fbaMaxDimWeight = parseFloat(defaultsFirstResult.getValue({name: 'custrecord_br_costdef_fba_max_dim_wt'}));

                    // log.debug({title: 'FBA Min Dim Weight', details: fbaMinDimWeight});
                    // log.debug({title: 'FBA Max Dim Weight', details: fbaMaxDimWeight});


                //Determine if weight or dimensional weight should be used (greater of the 2 Ceilings)
                weight = itemFbaDimWeight
                var itemWeightCeil = Math.ceil(itemActualWeight);

                if (itemWeightCeil > itemFbaDimWeight || itemWeightCeil <= fbaMinDimWeight || itemWeightCeil > fbaMaxDimWeight){
                    weight = itemActualWeight
                }
                    log.debug({title: 'Weight', details: weight});

                //************************************************************
            //Search for corresponding FBA Fulfillment Record
                var fbaFulfillFees = search.create({ 
                    type: "customrecord_br_fba_fulfillment_rates", 
                    filters:
                        [
                            ['custrecord_br_fbafulfill_wt_min', 'lessthan', weight],
                            "AND",
                            ['custrecord_br_fbafulfill_wt_max','greaterthanorequalto', weight],
                            "AND",
                            ['custrecord_br_fbafulfill_length','greaterthanorequalto',itemLength],
                            "AND",
                            ['custrecord_br_fbafulfill_width','greaterthanorequalto',itemWidth],
                            "AND",
                            ['custrecord_br_fbafulfill_height','greaterthanorequalto',itemHeight],
                            "AND",
                            ['custrecord_br_fbafulfill_len_girth','greaterthan',itemLenGirth]
                        ],
                    columns:
                        [
                            'internalid',
                            'custrecord_br_fbafulfill_wt_min', //test
                            //'custrecord_br_fbafulfill_wt_max', //test
                            search.createColumn({
                                name: "custrecord_br_fbafulfill_wt_max",
                                sort: search.Sort.ASC
                            }),
                            'custrecord_br_fbafulfill_base_fee',
                            'custrecord_br_fbafulfill_fee_per_lb',
                            'custrecord_br_fbafulfill_per_lb_trigger',
                            // 'custrecord_br_fbafulfill_length', //test
                            // 'custrecord_br_fbafulfill_width', //test
                            // 'custrecord_br_fbafulfill_height', //test
                            // 'custrecord_br_fbafulfill_len_girth' //test
                        ]
                })
                var fbaFeeSearchResults = fbaFulfillFees.run();
                var fbaFeeFirstResult = fbaFeeSearchResults.getRange({
                    start: 0,
                    end: 1
                }) [0];

            //Get FBA Fulfillment Cost Values
            //     var fbaMinWeight = fbaFeeFirstResult.getValue({name: 'custrecord_br_fbafulfill_wt_min'});
            //     var fbaMaxWeight = fbaFeeFirstResult.getValue({name: 'custrecord_br_fbafulfill_wt_max'});
            //     var fbaLength = fbaFeeFirstResult.getValue({name: 'custrecord_br_fbafulfill_length'});
            //     var fbaWidth =fbaFeeFirstResult.getValue({name: 'custrecord_br_fbafulfill_width'});
            //     var fbaHeight = fbaFeeFirstResult.getValue({name: 'custrecord_br_fbafulfill_height'});
            //     var fbaLenGirth = fbaFeeFirstResult.getValue({name: 'custrecord_br_fbafulfill_len_girth'});
                    // log.debug({title: 'FBA MinWeight', details: fbaMinWeight});
                    // log.debug({title: 'FBA MaxWeight', details: fbaMaxWeight});
                    // log.debug({title: 'FBA Length', details: fbaLength});
                    // log.debug({title: 'FBA Width', details: fbaWidth});
                    // log.debug({title: 'FBA Height', details: fbaHeight});
                    // log.debug({title: 'FBA Len+Girth', details: fbaLenGirth});


                var fbaFeeId = fbaFeeFirstResult.getValue({name: 'internalid'});
                var fbaBaseFee = parseFloat(fbaFeeFirstResult.getValue({name: 'custrecord_br_fbafulfill_base_fee'}));
                var fbaFeePerPound = parseFloat(fbaFeeFirstResult.getValue({name: 'custrecord_br_fbafulfill_fee_per_lb'}));
                var fbaPerPoundTrigger = parseFloat(fbaFeeFirstResult.getValue({name: 'custrecord_br_fbafulfill_per_lb_trigger'}));

                    // log.debug({title: 'FBA Fee Record ID', details: fbaFeeId});
                    log.debug({title: 'FBA Base Fee', details: fbaBaseFee});
                    log.debug({title: 'FBA Fee per Pound', details: fbaFeePerPound});
                    log.debug({title: 'FBA Per Pound Trigger', details: fbaPerPoundTrigger});


            //************************************************************
            //LOGIC TIME - Calculate which fees apply to the item

                //Weight over Per Pound Trigger
                var weightOverPerLbTrigger = weight - fbaPerPoundTrigger;
                //pounds over trigger * Fee per Pound
                var amzPerPoundFees = weightOverPerLbTrigger * fbaFeePerPound;

            //************************************************************
            //Set values on Item Master Costing Record
               record.setValue({fieldId: 'custrecord_br_cost_fba_fulfill_rec', value: fbaFeeId});
               record.setValue({fieldId: 'custrecord_br_cost_fba_base_fee', value: fbaBaseFee});
               record.setValue({fieldId: 'custrecord_br_cost_fba_addl_per_lb', value: amzPerPoundFees});

            } catch (e) {
                log.error('onAction', JSON.parse(JSON.stringify(e)));
            }
        }

        return {
            onAction: onAction,
        };

    }
);