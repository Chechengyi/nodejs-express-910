
var length = 7

function arrToMySqlIn ( arr ) {
    var str = ''
    if ( arr.length === 1 ) {
        str = '(' + arr[0] + ')'
    } else {
        for ( var i=0; i<arr.length; i++ ) {
            if ( i===0 ) {
                str += '(' + arr[i] + ','
            } else if (i===arr.length - 1) {
                str += arr[i] + ')'
            } else {
                str += arr[i] + ','
            }
        }
    }
    return str
}

function orderCode ( id ) {
    var orderCode = ''
    var id_length = ( '' + id).length
    for ( var i=0; i<length - id_length; i++ ) {
        orderCode += 0
    }
    orderCode += id
    return orderCode
}

// module.exports = arrToMySqlIn
exports.arrToMySqlIn = arrToMySqlIn
exports.orderCode = orderCode