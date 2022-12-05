/**
 * @NApiVersion 2.x
 * @NModuleScope SameAccount
 * @NScriptType UserEventScript
 * @see https://system.netsuite.com/app/help/helpcenter.nl?fid=section_4387799721.html
 */

/**
 * Adds a button to the product development custom record that allows
 * an item to be created using the item data stored there.
 */


define(['N/record', 'N/log'],

    function (recordModule, logModule) {

        function beforeLoad(context) {
            try {
                if(context.type == context.UserEventType.CREATE) {
                    return;
                }

                var recID = context.newRecord.id;

                //add Button and Client Script Reference

                context.form.addButton({
                    id: 'custpage_create_item_record',
                    label: 'Create Item',
                    functionName: 'createNewItem("' + recID + '")'
                });
                context.form.clientScriptModulePath = './BR_CS_ProdDev_ItemCreate.js';

            } catch (e) {
                logModule.error('beforeLoad', JSON.parse(JSON.stringify(e)));
            }
        }

        return {
            beforeLoad: beforeLoad,
        };

    }
);
