/**
 * @NApiVersion 2.x
 * @NModuleScope SameAccount
 * @NScriptType WorkflowActionScript
 * @see https://system.netsuite.com/app/help/helpcenter.nl?fid=section_4460429314.html
 */

/**
 * Created by: Mark Chuberka
 * Date Created: 2022-04-29
 * Last Update: 2022-05-03
 * Version 0.91
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
            var costBaseFee = 0;
            var costResidentialFee = 0;
            var costFuelSurchargePct = 0;
            var costPeakSurchargeTotal = 0;
            var costExtDelivAreaSrchg = 0;
            var costRemoteDelAreaSrchg = 0;
            var costOtherSurcharges = 0;

            //Large Package
            var costLargePackage = 0;
            var costLgPkgLenGirthRes = 0;
            var costLgPkgLengthRes = 0;
            var costLgPkgLenGirthCom = 0;
            var costLgPkgLengthCom = 0;
            var costPeakSurchargeLarge = 0;

            //Additional Handling
            var costAdditionalHandling = 0;
            var costPeakSurchargeAH = 0;

            //Over Maximum Limits
            var costMaxLimitFee = 0;


        /**
         * @param {OnActionContext} context
         * @return {void}
         */
        function onAction(context) {
            try {
                var record = context.newRecord;

            //Load Item Cost Master Field Values
                var itemDimWeight = record.getValue({fieldId: 'custrecord_br_cost_item_dimweight'});
                var itemActualWeight = record.getValue({fieldId: 'custrecord_br_cost_item_weight'});
                var itemLength = record.getValue({fieldId: 'custrecord_br_cost_item_length'});
                var itemWidth = record.getValue({fieldId: 'custrecord_br_cost_item_width'});
                // var itemHeight = record.getValue({fieldId: 'custrecord_br_cost_item_height'});
                var itemLenGirth = record.getValue({fieldId: 'custrecord_br_cost_item_length_girth'});
                var itemMaxPerLabel = record.getValue({fieldId: 'custrecord_br_cost_item_max_per_label'});
                var globalDefaults = record.getValue({fieldId: 'custrecord_br_cost_default_values'});
            //Determine if weight or dimensional weight should be used (greater of the 2 Ceilings)
                var itemWeightCeil = Math.ceil(itemActualWeight);
                    if (itemDimWeight >= itemWeightCeil) {
                        weight = itemDimWeight
                    }else
                        {weight = itemWeightCeil
                    }
                // log.debug({title: 'itemLength', details: itemLength});
                // log.debug({title: 'itemWidth', details: itemWidth});
                // log.debug({title: 'itemHeight', details: itemHeight});
                // log.debug({title: 'itemLenGirth', details: itemLenGirth});
                // log.debug({title: 'globalDefaults', details: globalDefaults});
                // log.debug({title: 'itemDimWeight', details: itemDimWeight});
                // log.debug({title: 'itemActualWeight', details: itemActualWeight});
                // log.debug({title: 'itemWeightCeil', details: itemWeightCeil});
                // log.debug({title: 'weight', details: weight});



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
                            'custrecord_br_costdef_lg_leng_grth_res',
                            'custrecord_br_costdef_lg_length_res',
                            'custrecord_br_costdef_lg_leng_grth_com',
                            'custrecord_br_costdef_lg_length_com',
                            'custrecord_br_costdef_lg_pkg_min_weight',
                            'custrecord_br_costdef_ah_weight',
                            'custrecord_br_costdef_ah_leng_grth',
                            'custrecord_br_costdef_ah_length',
                            'custrecord_br_costdef_ah_width',
                            'custrecord_br_costdef_ah_packaging',
                            'custrecord_br_costdef_max_weight',
                            'custrecord_br_costdef_max_leng_grth',
                            'custrecord_br_costdef_max_length',
                            'custrecord_br_costdef_over_max_limit_fee',
                            'custrecord_br_costdef_fuel_surcharge',
                            'custrecord_br_costdef_peak_surcharge_std',
                            'custrecord_br_costdef_peak_surcharge_hol',
                            'custrecord_br_costdef_extnd_deliv_pct',
                            'custrecord_br_costdef_ext_del_surch_res',
                            'custrecord_br_costdef_ext_del_surch_com',
                            'custrecord_br_costdef_remote_deliv_pct',
                            'custrecord_br_costdef_delv_area_surc_rem',
                            'custrecord_br_costdef_other_surcharges',
                            'custrecord_br_costdef_residential_pct'
                        ]
                })
                var defaultsSearchResults = defaultsRecord.run();
                var defaultsFirstResult = defaultsSearchResults.getRange({
                    start: 0,
                    end: 1
                }) [0];

            //set Values from Global Default Record
                var costdefLgPkgLenGirthRes = parseFloat(defaultsFirstResult.getValue({name: 'custrecord_br_costdef_lg_leng_grth_res'}));
                var costdefLgPkgLengthRes = parseFloat(defaultsFirstResult.getValue({name: 'custrecord_br_costdef_lg_length_res'}));
                var costdefLgPkgLenGirthCom = parseFloat(defaultsFirstResult.getValue({name: 'custrecord_br_costdef_lg_leng_grth_com'}));
                var costdefLgPkgLengthCom = parseFloat(defaultsFirstResult.getValue({name: 'custrecord_br_costdef_lg_length_com'}));
                var costdefLgPkgMinWeight = parseFloat(defaultsFirstResult.getValue({name: 'custrecord_br_costdef_lg_pkg_min_weight'}));
                var costdefAHWeight = parseFloat(defaultsFirstResult.getValue({name: 'custrecord_br_costdef_ah_weight'}));
                var costdefAHLenGirth = parseFloat(defaultsFirstResult.getValue({name: 'custrecord_br_costdef_ah_leng_grth'}));
                var costdefAHLength = parseFloat(defaultsFirstResult.getValue({name: 'custrecord_br_costdef_ah_length'}));
                var costdefAHWidth = parseFloat(defaultsFirstResult.getValue({name: 'custrecord_br_costdef_ah_width'}));
                var costdefAHPackaging = parseFloat(defaultsFirstResult.getValue({name: 'custrecord_br_costdef_ah_packaging'}));
                var costdefMaxWeight = parseFloat(defaultsFirstResult.getValue({name: 'custrecord_br_costdef_max_weight'}));
                var costdefMaxLenGirth = parseFloat(defaultsFirstResult.getValue({name: 'custrecord_br_costdef_max_leng_grth'}));
                var costdefMaxLength = parseFloat(defaultsFirstResult.getValue({name: 'custrecord_br_costdef_max_length'}));
                var costdefMaxLimitFee = parseFloat(defaultsFirstResult.getValue({name: 'custrecord_br_costdef_over_max_limit_fee'}));
                var costdefFuelSurcharge = parseFloat(defaultsFirstResult.getValue({name: 'custrecord_br_costdef_fuel_surcharge'}));
                var costdefPeakSurchargeStd = parseFloat(defaultsFirstResult.getValue({name: 'custrecord_br_costdef_peak_surcharge_std'}));
                var costdefPeakSurchargeHol = parseFloat(defaultsFirstResult.getValue({name: 'custrecord_br_costdef_peak_surcharge_hol'}));
                var costdefExtendedAreaPct = parseFloat(defaultsFirstResult.getValue({name: 'custrecord_br_costdef_extnd_deliv_pct'}));
                var costdefExtDelSurchRes = parseFloat(defaultsFirstResult.getValue({name: 'custrecord_br_costdef_ext_del_surch_res'}));
                var costdefExtDelSurchCom = parseFloat(defaultsFirstResult.getValue({name: 'custrecord_br_costdef_ext_del_surch_com'}));
                var costdefRemoteAreaPct = parseFloat(defaultsFirstResult.getValue({name: 'custrecord_br_costdef_remote_deliv_pct'}));
                var costdefRemoteDelSurch = parseFloat(defaultsFirstResult.getValue({name: 'custrecord_br_costdef_delv_area_surc_rem'}));
                var costdefOtherSurcharges = parseFloat(defaultsFirstResult.getValue({name: 'custrecord_br_costdef_other_surcharges'}));
                var costdefResidentialPct = parseFloat(defaultsFirstResult.getValue({name: 'custrecord_br_costdef_residential_pct'}));

            //calculate percentages since NS brings in the raw number from percent fields
                costdefExtendedAreaPct = (0.01 * costdefExtendedAreaPct).toFixed(5);
                costdefRemoteAreaPct = (0.01 * costdefRemoteAreaPct).toFixed(5);
                costdefResidentialPct = (0.01 * costdefResidentialPct).toFixed(5);
                var costdefCommercialPct = (1 - costdefResidentialPct).toFixed(5);

                    // log.debug({title: 'costdefLgPkgLenGirthRes', details: costdefLgPkgLenGirthRes});
                    // log.debug({title: 'costdefLgPkgLengthRes', details: costdefLgPkgLengthRes});
                    // log.debug({title: 'costdefLgPkgLenGirthCom', details: costdefLgPkgLenGirthCom});
                    // log.debug({title: 'costdefLgPkgLengthCom', details: costdefLgPkgLengthCom});
                    // log.debug({title: 'costdefLgPkgMinWeight', details: costdefLgPkgMinWeight});
                    // log.debug({title: 'costdefAHWeight', details: costdefAHWeight});
                    // log.debug({title: 'costdefAHLenGirth', details: costdefAHLenGirth});
                    // log.debug({title: 'costdefAHLength', details: costdefAHLength});
                    // log.debug({title: 'costdefAHWidth', details: costdefAHWidth});
                    // log.debug({title: 'costdefAHPackaging', details: costdefAHPackaging});
                    // log.debug({title: 'costdefMaxWeight', details: costdefMaxWeight});
                    // log.debug({title: 'costdefMaxLenGirth', details: costdefMaxLenGirth});
                    // log.debug({title: 'costdefMaxLength', details: costdefMaxLength});
                    // log.debug({title: 'costdefMaxLimitFee', details: costdefMaxLimitFee});
                    // log.debug({title: 'costdefFuelSurcharge', details: costdefFuelSurcharge});
                    // log.debug({title: 'costdefPeakSurchargeStd', details: costdefPeakSurchargeStd});
                    // log.debug({title: 'costdefPeakSurchargeHol', details: costdefPeakSurchargeHol});
                    // log.debug({title: 'costdefDelvAreaSurcRem', details: costdefDelvAreaSurcRem});
                    // log.debug({title: 'costdefOtherSurcharges', details: costdefOtherSurcharges});
                    // log.debug({title: 'costdefResidentialPct', details: costdefResidentialPct});
                    // log.debug({title: 'costdefCommercialPct', details: costdefCommercialPct});
                    // log.debug({title: 'costdefExtendedAreaPct', details: costdefExtendedAreaPct});
                    // log.debug({title: 'costdefExtDelSurchRes', details: costdefExtDelSurchRes});
                    // log.debug({title: 'costdefExtDelSurchCom', details: costdefExtDelSurchCom});
                    // log.debug({title: 'costdefRemoteAreaPct', details: costdefRemoteAreaPct});
                    // log.debug({title: 'costdefRemoteDelSurch', details: costdefRemoteDelSurch});

    //************************************************************
            //Large Package Minimum Wt is 90. Check if Large Package applies and if so, set weight to custdefault large package min weight
                if (weight < costdefLgPkgMinWeight){
                    if (itemLength > costdefLgPkgLengthRes || itemLength > costdefLgPkgLengthCom){
                        weight = costdefLgPkgMinWeight
                    }
                    if (itemLenGirth > costdefLgPkgLenGirthRes || itemLenGirth > costdefLgPkgLenGirthCom){
                        weight = costdefLgPkgMinWeight
                    }
                }
                    // log.debug({title: 'LgPackage Weight Check', details: weight});

    //************************************************************
            //Search for corresponding Delivered Costs Record based on weight
                var dcRecordId = search.create({
                    type: "customrecord_br_delivered_costs",
                    filters:
                        [
                            ["isinactive","is","F"],
                            "AND",
                            ["custrecord_br_delvd_shipping_weight","equalto", weight]
                        ],
                    columns:
                        [
                            "internalid"
                        ]
                })
                var dcResultId = dcRecordId.run();
                var firstResult = dcResultId.getRange({
                    start: 0,
                    end: 1
                }) [0];
                var deliveredCostId = firstResult.getValue({name: 'internalid'});

                    // log.debug({title: 'Delivered Cost ID', details: deliveredCostId});

    //************************************************************
            //Search for corresponding Delivered Cost Record
                var deliveredCosts = search.create({
                    type: "customrecord_br_delivered_costs",
                    filters:
                        [
                            ["isinactive","is","F"],
                            "AND",
                            ['internalid',"is", deliveredCostId]
                        ],
                    columns:
                        [
                            'custrecord_br_delvd_base_fbm',
                            'custrecord_br_delvd_residential_fbm',
                            'custrecord_br_delvd_overmaxlimit_fbm',
                            'custrecord_br_delvd_peak_lgpkg_std_fbm',
                            'custrecord_br_delvd_peak_addlhnd_std_fbm',
                            'custrecord_br_delvd_ah_weight_fbm',
                            'custrecord_br_delvd_ah_len_girth_fbm',
                            'custrecord_br_delvd_ah_length_fbm',
                            'custrecord_br_delvd_ah_width_fbm',
                            'custrecord_br_delvd_ah_pkgng_fbm',
                            'custrecord_br_delvd_res_len_girth_fbm',
                            'custrecord_br_delvd_res_length_fbm',
                            'custrecord_br_delvd_com_len_girth_fbm',
                            'custrecord_br_delvd_com_length_fbm'
                        ]
                })
                var dcSearchResults = deliveredCosts.run();
                var dcFirstResult = dcSearchResults.getRange({
                    start: 0,
                    end: 1
                }) [0];

            //Get Delivered Cost Field Values
                var delvdBaseFee = parseFloat(dcFirstResult.getValue({name: 'custrecord_br_delvd_base_fbm'}));
                var delvdResidentialFee = parseFloat(dcFirstResult.getValue({name: 'custrecord_br_delvd_residential_fbm'}));
                var delvdPeakSurchargeLarge = parseFloat(dcFirstResult.getValue({name: 'custrecord_br_delvd_peak_lgpkg_std_fbm'}));
                var delvdPeakSurchargeAH = parseFloat(dcFirstResult.getValue({name: 'custrecord_br_delvd_peak_addlhnd_std_fbm'}));
                var delvdAHWeight = parseFloat(dcFirstResult.getValue({name: 'custrecord_br_delvd_ah_weight_fbm'}));
                var delvdAHLenGirth = parseFloat(dcFirstResult.getValue({name: 'custrecord_br_delvd_ah_len_girth_fbm'}));
                var delvdAHLength = parseFloat(dcFirstResult.getValue({name: 'custrecord_br_delvd_ah_length_fbm'}));
                var delvdAHWidth = parseFloat(dcFirstResult.getValue({name: 'custrecord_br_delvd_ah_width_fbm'}));
                var delvdAHPackaging = parseFloat(dcFirstResult.getValue({name: 'custrecord_br_delvd_ah_pkgng_fbm'}));
                var delvdLgPkgLengthRes = parseFloat(dcFirstResult.getValue({name: 'custrecord_br_delvd_res_length_fbm'}));
                var delvdLgPkgLengthCom = parseFloat(dcFirstResult.getValue({name: 'custrecord_br_delvd_com_length_fbm'}));
                var delvdLgPkgLenGirthRes = parseFloat(dcFirstResult.getValue({name: 'custrecord_br_delvd_res_len_girth_fbm'}));
                var delvdLgPkgLenGirthCom = parseFloat(dcFirstResult.getValue({name: 'custrecord_br_delvd_com_len_girth_fbm'}));

                    // log.debug({title: 'delvdBaseFee', details: delvdBaseFee});
                    // log.debug({title: 'delvdResidentialFee', details: delvdResidentialFee});
                    // log.debug({title: 'delvdPeakSurchargeLarge', details: delvdPeakSurchargeLarge});
                    // log.debug({title: 'delvdPeakSurchargeAH', details: delvdPeakSurchargeAH});
                    // log.debug({title: 'delvdAHWeight', details: delvdAHWeight});
                    // log.debug({title: 'delvdAHLenGirth', details: delvdAHLenGirth});
                    // log.debug({title: 'delvdAHLength', details: delvdAHLength});
                    // log.debug({title: 'delvdAHWidth', details: delvdAHWidth});
                    // log.debug({title: 'delvdAHPackaging', details: delvdAHPackaging});
                    // log.debug({title: 'delvdLgPkgLenGirthRes', details: delvdLgPkgLenGirthRes});
                    // log.debug({title: 'delvdLgPkgLengthRes', details: delvdLgPkgLengthRes});
                    // log.debug({title: 'delvdLgPkgLenGirthCom', details: delvdLgPkgLenGirthCom});
                    // log.debug({title: 'delvdLgPkgLengthCom', details: delvdLgPkgLengthCom});




    //************************************************************
            //LOGIC TIME - Calculate which fees apply to the item

                //Fees that apply to all Shipments
                costBaseFee = delvdBaseFee;
                costResidentialFee = delvdResidentialFee;
                costFuelSurchargePct = costdefFuelSurcharge;
                costPeakSurchargeTotal = (costdefPeakSurchargeStd + costdefPeakSurchargeHol);
                costExtDelivAreaSrchg = (costdefExtendedAreaPct * ((costdefResidentialPct * costdefExtDelSurchRes) + (costdefCommercialPct * costdefExtDelSurchCom))).toFixed(5);
                costRemoteDelAreaSrchg = (costdefRemoteAreaPct * costdefRemoteDelSurch);
                costOtherSurcharges = costdefOtherSurcharges;

                    // log.debug({title: 'costBaseFee', details: costBaseFee});
                    // log.debug({title: 'costResidentialFee', details: costResidentialFee});
                    // log.debug({title: 'costFuelSurchargePct', details: costFuelSurchargePct});
                    // log.debug({title: 'costPeakSurchargeTotal', details: costPeakSurchargeTotal});
                    // log.debug({title: 'costExtDelivAreaSrchg', details: costExtDelivAreaSrchg});
                    // log.debug({title: 'costRemoteDelAreaSrchg', details: costRemoteDelAreaSrchg});
                    // log.debug({title: 'costOtherSurcharges', details: costOtherSurcharges});

            //Large Package Fee Check
                // import Large Package Peak Surcharge
                costPeakSurchargeLarge = delvdPeakSurchargeLarge

                //Run through Large Package Triggers (reverse priority) and set record informational checkboxes
                //Priority 2: Large Package Length
                if (itemLength >= costdefLgPkgLengthRes){
                    costLgPkgLengthRes = delvdLgPkgLengthRes
                    record.setValue({fieldId: 'custrecord_br_cost_res_length_fbm', value: true})
                }
                if (itemLength >= costdefLgPkgLengthCom){
                    costLgPkgLengthCom = delvdLgPkgLengthCom
                    record.setValue({fieldId: 'custrecord_br_cost_com_length_fbm', value: true})
                }
                    // log.debug({title: 'costLgPkgLengthRes', details: costLgPkgLengthRes});
                    // log.debug({title: 'costLgPkgLengthCom', details: costLgPkgLengthCom});

                costLargePackage = (costLgPkgLengthRes + costLgPkgLengthCom);
                    // log.debug({title: 'costLargePackage Length', details: costLargePackage});

                //Priority 1: Large Package Length + Girth
                if (itemLenGirth >= costdefLgPkgLenGirthRes) {
                    costLgPkgLenGirthRes = delvdLgPkgLenGirthRes
                    record.setValue({fieldId: 'custrecord_br_cost_res_len_girth_fbm', value: true})
                }
                if (itemLenGirth >= costdefLgPkgLenGirthCom) {
                    costLgPkgLenGirthCom = delvdLgPkgLenGirthCom
                    record.setValue({fieldId: 'custrecord_br_cost_com_len_girth_fbm', value: true})
                }
                    // log.debug({title: 'costLgPkgLenGirthRes', details: costLgPkgLenGirthRes});
                    // log.debug({title: 'costLgPkgLenGirthCom', details: costLgPkgLenGirthCom});

                //determine which prioritized amount is used on this item
                if ((costLgPkgLenGirthRes + costLgPkgLenGirthCom) > (costLgPkgLengthRes + costLgPkgLengthCom)){
                    costLargePackage = (costLgPkgLenGirthRes + costLgPkgLenGirthCom);
                }
                    // log.debug({title: 'costLargePackage Final', details: costLargePackage});

                //clear large peak surcharge if large package fee doesn't apply
                if (costLargePackage <= 0){
                    costPeakSurchargeLarge = 0
                }
                    // log.debug({title: 'costPeakSurchargeLarge', details: costPeakSurchargeLarge});


            //Additional Handling Fee Check
                // import Additional Handling Peak Surcharge
                costPeakSurchargeAH = delvdPeakSurchargeAH;

                //Run through Additional Handling (reverse priority) and check record informational boxes
                //Priority 5: Packaging
                if (itemMaxPerLabel > costdefAHPackaging) {
                    costAdditionalHandling = delvdAHPackaging
                    record.setValue({fieldId: 'custrecord_br_cost_ah_pkgng_fbm', value: true})
                }
                    // log.debug({title: 'costAHPackaging', details: costAdditionalHandling});
                //Priority 4: Width (2nd longest dimension)
                if (itemWidth > costdefAHWidth){
                        costAdditionalHandling = delvdAHWidth
                        record.setValue({fieldId: 'custrecord_br_cost_ah_width_fbm', value: true})
                }
                    // log.debug({title: 'costAHWidth', details: costAdditionalHandling});
                //Priority 3: Length (longest dimension)
                if (itemLength > costdefAHLength){
                    costAdditionalHandling = delvdAHLength
                    record.setValue({fieldId: 'custrecord_br_cost_ah_length_fbm', value: true})
                }
                    // log.debug({title: 'costAHLength', details: costAdditionalHandling});
                //Priority 2: Length + Girth
                if (itemLenGirth > costdefAHLenGirth){
                    costAdditionalHandling = delvdAHLenGirth
                    record.setValue({fieldId: 'custrecord_br_cost_ah_len_girth_fbm', value: true})
                }
                    // log.debug({title: 'costAHLenGirth', details: costAdditionalHandling});
                //Priority 1: Weight
                if (itemActualWeight > costdefAHWeight){
                    costAdditionalHandling = delvdAHWeight
                    record.setValue({fieldId: 'custrecord_br_cost_ah_weight_fbm', value: true})
                }
                    // log.debug({title: 'costAHWeight', details: costAdditionalHandling});


            //If Large Package Fee applies, Additional Handling Fee is 0 (Large Package Fees take priority as an either/or)
            if (costLargePackage > 0){
                costAdditionalHandling = 0
            }
                // log.debug({title: 'Additional Handling Applied', details: costAdditionalHandling});

            //clear AH peak surcharge if additional handling fee doesn't apply
            if (costAdditionalHandling <= 0){
                costPeakSurchargeAH = 0
            }
            // log.debug({title: 'costPeakSurchargeAH', details: costPeakSurchargeAH});

        //Over Maximum Limits Fee Check
            //If any of the triggers is met, add max limit fee.
            if (itemActualWeight > costdefMaxWeight){
                costMaxLimitFee = costdefMaxLimitFee
                record.setValue({fieldId: 'custrecord_br_cost_max_weight_fbm', value: true})
            }
            if (itemLength > costdefMaxLength){
                costMaxLimitFee = costdefMaxLimitFee
                record.setValue({fieldId: 'custrecord_br_cost_max_length_fbm', value: true})
            }
            if (itemLenGirth > costdefMaxLenGirth){
                costMaxLimitFee = costdefMaxLimitFee
                record.setValue({fieldId: 'custrecord_br_cost_max_len_girth_fbm', value: true})
            }
                // log.debug({title: 'costMaxLimitFee', details: costMaxLimitFee});


    //************************************************************
            //Set values on Item Master Costing Record
                //Applies to all
                record.setValue({fieldId: 'custrecord_br_cost_base_fee_fbm', value: costBaseFee});
                record.setValue({fieldId: 'custrecord_br_cost_residential_fee_fbm', value: costResidentialFee});
                record.setValue({fieldId: 'custrecord_br_cost_fuel_surch_pct_fbm', value: costFuelSurchargePct});
                record.setValue({fieldId: 'custrecord_br_cost_total_peak_surch_fbm', value: costPeakSurchargeTotal});
                record.setValue({fieldId: 'custrecord_br_cost_area_surcharge_fbm', value: costExtDelivAreaSrchg});
                record.setValue({fieldId: 'custrecord_br_cost_rem_area_surchge_fbm', value: costRemoteDelAreaSrchg});
                record.setValue({fieldId: 'custrecord_br_cost_other_surcharges_fbm', value: costOtherSurcharges});
                //Large Package
                record.setValue({fieldId: 'custrecord_br_cost_peak_lgpkg_fbm', value: costPeakSurchargeLarge});
                record.setValue({fieldId: 'custrecord_br_cost_lg_package_fee_fbm', value: costLargePackage});
                //Additional Handling
                record.setValue({fieldId: 'custrecord_br_cost_peak_addlhnd_fbm', value: costPeakSurchargeAH});
                record.setValue({fieldId: 'custrecord_br_cost_addl_handling_fbm', value: costAdditionalHandling});
                //Over Maximum Limits
                record.setValue({fieldId: 'custrecord_br_cost_overmaxlimit_fbm', value: costMaxLimitFee});

            } catch (e) {
                log.error('onAction', JSON.parse(JSON.stringify(e)));
            }
        }

        return {
            onAction: onAction,
        };

    }
);