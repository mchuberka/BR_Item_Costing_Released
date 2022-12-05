// Set the Item's Price Level to Alternate Price When the Sales Order Is Created via Web Services With SuiteScript 2.0

function beforeSubmit(scriptContext) {
    log.debug({ title: 'beforeSubmit', details: 'before submit starting..' });

    var isGroup = 'F';
    var itemName = '';
    var itemType = '';
    log.debug({ title: 'Initialization', details: 'isGroup: ' + isGroup + ", itemName: " + itemName + ", itemType: " + itemType });

    var newRec = scriptContext.newRecord;
    var contextType = runtime.executionContext;

    //check the context and validate if it is from web service
    if (contextType == 'WEBSERVICES') {

        // get the line count of the sublist
        var getLineCount = newRec.getLineCount({ sublistId: 'item' });
        log.debug({ title: 'Get Line Count', details: 'getLineCount: ' + getLineCount });

        //loop to each items and get internal ID and item type
        for (var i = 0; i < getLineCount; i++) {
            //Get item name to get item type
            itemName = newRec.getSublistValue({ sublistId: "item", fieldId: "item", line: i });
            // check if this is the end of the line item, if yes, itemType should be null/empty, else perform search of the type field on item record
        if (itemName == '0') { itemType = '';
        } else {
            var itemTypeLookUp = search.lookupFields({
                type: search.Type.ITEM,
                id: itemName,
                columns: ["type"]
            });
            var itemTypeObj = itemTypeLookUp.type[0];
            itemType = itemTypeObj.value;
        }

        //if itemType is null/empty, flag isGroup should be False
        if (itemType == null || itemType == '') {
            isGroup = 'F';
        } if (isGroup = 'T') {
            if (itemType == 'InvtPart') {
                newRec.setSublistValue({
                    sublistId: "item",
                    fieldId: "price",
                    line: i,
                    value: '2' });
                var getPrice = newRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'price',
                    line: i
                });
                newRec.setSublistValue({
                    sublistId: "item",
                    fieldId: "taxcode",
                    line: i,
                    value: '-336' });
            }
        } if (itemType == 'Group') {
            isGroup = 'T';
        }
        }
    }
}
