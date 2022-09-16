/**
 * @NApiVersion 2.x
 * @NModuleScope SameAccount
 * @NScriptType WorkflowActionScript
 * @see https://system.netsuite.com/app/help/helpcenter.nl?fid=section_4460429314.html
 */

/**
 * Created by: Mark Chuberka
 * Date Created: 2022-04-25
 * Last Update: 2022-04-27
 * Version 0.9
 */

define(['N/search'],

    /**
     * @return {{
     *   onAction: Function,
     * }}
     */
    function (search) {
        /**
         * @param {OnActionContext} context
         * @return {void}
         */

        const exports = {};

        function onAction(context) {
            try {
                const deliveredCost = context.newRecord;
                const weight = deliveredCost.getValue({fieldId: 'custrecord_br_delvd_shipping_weight'});
                var resDeliveryPct = deliveredCost.getValue({fieldId: 'custrecord_br_delvd_residential_pct'});
                resDeliveryPct = (0.01 * resDeliveryPct);
                var comDeliveryPct = (1 - resDeliveryPct).toFixed(2);
                const upsRateDiscountPct = deliveredCost.getValue({fieldId: 'custrecord_br_delvd_ups_discount_pct'});
                var upsRateModifier = (1 - (upsRateDiscountPct * 0.01));

                        //log.debug({title: 'Shipping weight', details: weight});
                        //log.debug({title: 'Residential Pct', details: resDeliveryPct});
                        //log.debug({title: 'Commercial Pct', details: comDeliveryPct});

            // search for all records that have the same weight.
                var rateSearch = search.create({
                    type: 'customrecord_br_shipping_rate_table',
                //Set Filters
                    filters:
                        [
                            ["isinactive","is","F"],
                            "AND",
                            ["custrecord_br_ratetable_weight","equalto",weight]
                        ],
                    columns: [
                        search.createColumn({
                            name: "custrecord_br_ratetable_base_fee_wt",
                            summary: search.Summary.SUM
                        }),
                       search.createColumn({
                            name: "custrecord_br_ratetable_resident_fee_wt",
                            summary: search.Summary.SUM
                        }),
                        search.createColumn({
                            name: "custrecord_br_ratetable_overmaxlmt_wt",
                            summary: search.Summary.SUM
                        }),
                        search.createColumn({
                            name: "custrecord_br_ratetable_peaksurc_lg_wt",
                            summary: search.Summary.SUM
                        }),
                        search.createColumn({
                            name: "custrecord_br_ratetable_peaksurc_addl_wt",
                            summary: search.Summary.SUM
                        }),
                        search.createColumn({
                            name: "custrecord_br_ratetable_ah_weight_wt",
                            summary: search.Summary.SUM
                        }),
                        search.createColumn({
                            name: "custrecord_br_ratetable_ah_len_girth_wt",
                            summary: search.Summary.SUM
                        }),
                        search.createColumn({
                            name: "custrecord_br_ratetable_ah_length_wt",
                            summary: search.Summary.SUM
                        }),
                        search.createColumn({
                            name: "custrecord_br_ratetable_ah_width_wt",
                            summary: search.Summary.SUM
                        }),
                        search.createColumn({
                            name: "custrecord_br_ratetable_ah_pkgng_wt",
                            summary: search.Summary.SUM
                        }),
                        search.createColumn({
                            name: "custrecord_br_ratetable_res_len_girth_wt",
                            summary: search.Summary.SUM
                        }),
                        search.createColumn({
                            name: "custrecord_br_ratetable_res_length_wt",
                            summary: search.Summary.SUM
                        }),
                        search.createColumn({
                            name: "custrecord_br_ratetable_com_len_girth_wt",
                            summary: search.Summary.SUM
                        }),
                        search.createColumn({
                            name: "custrecord_br_ratetable_com_length_wt",
                            summary: search.Summary.SUM
                        }),
                    ]
                });

                rateSearch.run().each(function (results) {
                    var baseFee = parseFloat(results.getValue({name: 'custrecord_br_ratetable_base_fee_wt', summary: search.Summary.SUM}));
                    var residentialFee = parseFloat(results.getValue({name: 'custrecord_br_ratetable_resident_fee_wt', summary: search.Summary.SUM}));
                    var overMaxLimitFee = parseFloat(results.getValue({name: 'custrecord_br_ratetable_overmaxlmt_wt', summary: search.Summary.SUM}));
                    var peakSurchargeLargePackage = parseFloat(results.getValue({name: 'custrecord_br_ratetable_peaksurc_lg_wt', summary: search.Summary.SUM}));
                    var peakSurchargeAddlHandling = parseFloat(results.getValue({name: 'custrecord_br_ratetable_peaksurc_addl_wt', summary: search.Summary.SUM}));
                    var ahWeightFee = parseFloat(results.getValue({name: 'custrecord_br_ratetable_ah_weight_wt', summary: search.Summary.SUM}));
                    var ahLengthGirthFee = parseFloat(results.getValue({name: 'custrecord_br_ratetable_ah_len_girth_wt', summary: search.Summary.SUM}));
                    var ahLengthFee = parseFloat(results.getValue({name: 'custrecord_br_ratetable_ah_length_wt', summary: search.Summary.SUM}));
                    var ahWidthFee = parseFloat(results.getValue({name: 'custrecord_br_ratetable_ah_width_wt', summary: search.Summary.SUM}));
                    var ahPackagingFee = parseFloat(results.getValue({name: 'custrecord_br_ratetable_ah_pkgng_wt', summary: search.Summary.SUM}));
                    var lgLengthGirthRes = parseFloat(results.getValue({name: 'custrecord_br_ratetable_res_len_girth_wt', summary: search.Summary.SUM}));
                    var lgLengthRes = parseFloat(results.getValue({name: 'custrecord_br_ratetable_res_length_wt', summary: search.Summary.SUM}));
                    var lgLengthGirthCom = parseFloat(results.getValue({name: 'custrecord_br_ratetable_com_len_girth_wt', summary: search.Summary.SUM}));
                    var lgLengthCom = parseFloat(results.getValue({name: 'custrecord_br_ratetable_com_length_wt', summary: search.Summary.SUM}));

                        //log.debug ({title: 'Total base fee', details: baseFee});
                        //log.debug ({title: 'Total residential fee', details: residentialFee});
                        //log.debug ({title: 'Total over max limit fee', details: overMaxLimitFee});
                        //log.debug ({title: 'Total peak large pkg fee', details: peakSurchargeLargePackage});
                        //log.debug ({title: 'Total peak addl handling fee', details: peakSurchargeAddlHandling});
                        //log.debug ({title: 'Total AH weight fee', details: ahWeightFee});
                        //log.debug ({title: 'Total AH length/girth fee', details: ahLengthGirthFee});
                        //log.debug ({title: 'Total AH length fee', details: ahLengthFee});
                        //log.debug ({title: 'Total AH width fee', details: ahWidthFee});
                        //log.debug ({title: 'Total AH packaging fee', details: ahPackagingFee});
                        //log.debug ({title: 'Total large length/girth Res fee', details: lgLengthGirthRes});
                        //log.debug ({title: 'Total large length Res fee', details: lgLengthRes});
                        //log.debug ({title: 'Total large length/girth Com fee', details: lgLengthGirthCom});
                        //log.debug ({title: 'Total large length Com fee', details: lgLengthCom});

                //Calculate the weighted values for residential and commercial delivery (using resDeliveryPct & comDeliveryPct)
                residentialFee = (residentialFee * resDeliveryPct);
                lgLengthGirthRes = (lgLengthGirthRes * resDeliveryPct);
                lgLengthRes = (lgLengthRes * resDeliveryPct);
                lgLengthGirthCom = (lgLengthGirthCom * comDeliveryPct);
                lgLengthCom = (lgLengthCom * comDeliveryPct);

                log.debug({title: 'Original AH Weight Fee', details: ahWeightFee});

                //Calculate UPS discounted amount for applicable fees
                    overMaxLimitFee = (upsRateModifier * overMaxLimitFee);
                    ahWeightFee = (upsRateModifier * ahWeightFee);
                    ahLengthGirthFee = (upsRateModifier * ahLengthGirthFee);
                    ahLengthFee = (upsRateModifier * ahLengthFee);
                    ahWidthFee = (upsRateModifier * ahWidthFee);
                    ahPackagingFee = (upsRateModifier * ahPackagingFee);
                    lgLengthGirthRes = (upsRateModifier * lgLengthGirthRes);
                    lgLengthRes = (upsRateModifier * lgLengthRes);
                    lgLengthGirthCom = (upsRateModifier * lgLengthGirthCom);
                    lgLengthCom = (upsRateModifier * lgLengthCom);

                    log.debug({title: 'Caluclated AH Weight Fee', details: ahWeightFee});
                        //log.debug({title: 'Weighted Res Fee', details: residentialFee});
                        //log.debug({title: 'Weighted lgLG Res Fee', details: lgLengthGirthRes});
                        //log.debug({title: 'Weighted length Res Fee', details: lgLengthRes});
                        //log.debug({title: 'Weighted lgLG Com Fee', details: lgLengthGirthCom});
                        //log.debug({title: 'Weighted length Com Fee', details: lgLengthCom});

                //set the record fields to the summarized total of the searched values.
                deliveredCost.setValue({
                    fieldId: 'custrecord_br_delvd_base_fbm',
                    value: baseFee
                });
                deliveredCost.setValue({
                    fieldId: 'custrecord_br_delvd_residential_fbm',
                    value: residentialFee
                });
                deliveredCost.setValue({
                    fieldId: 'custrecord_br_delvd_overmaxlimit_fbm',
                    value: overMaxLimitFee  
                });
                deliveredCost.setValue({
                    fieldId: 'custrecord_br_delvd_peak_lgpkg_std_fbm',
                    value: peakSurchargeLargePackage
                });
                deliveredCost.setValue({
                    fieldId: 'custrecord_br_delvd_peak_addlhnd_std_fbm',
                    value: peakSurchargeAddlHandling
                });
                deliveredCost.setValue({
                    fieldId: 'custrecord_br_delvd_ah_weight_fbm',
                    value: ahWeightFee  
                });
                deliveredCost.setValue({
                    fieldId: 'custrecord_br_delvd_ah_len_girth_fbm',
                    value: ahLengthGirthFee  
                });
                deliveredCost.setValue({
                    fieldId: 'custrecord_br_delvd_ah_length_fbm',
                    value: ahLengthFee  
                });
                deliveredCost.setValue({
                    fieldId: 'custrecord_br_delvd_ah_width_fbm',
                    value: ahWidthFee  
                });
                deliveredCost.setValue({
                    fieldId: 'custrecord_br_delvd_ah_pkgng_fbm',
                    value: ahPackagingFee  
                });
                deliveredCost.setValue({
                    fieldId: 'custrecord_br_delvd_res_len_girth_fbm',
                    value: lgLengthGirthRes  
                });
                deliveredCost.setValue({
                    fieldId: 'custrecord_br_delvd_res_length_fbm',
                    value: lgLengthRes  
                });
                deliveredCost.setValue({
                    fieldId: 'custrecord_br_delvd_com_len_girth_fbm',
                    value: lgLengthGirthCom  
                });
                deliveredCost.setValue({
                    fieldId: 'custrecord_br_delvd_com_length_fbm',
                    value: lgLengthCom  
                });
                return true;
            });

            } catch (e) {
                log.error('onAction', JSON.parse(JSON.stringify(e)));
            }
        }
        exports.onAction = onAction;
        return exports;

    }
);