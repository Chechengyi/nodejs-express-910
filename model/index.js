var orm = require('orm')
var url = require('../database.config')

var models = {}

orm.connect( url, function (err, db) {

    if ( err ) {
        console.log(err)
    } else {

        console.log('数据库连接成功')

        exports.db = db

        // 管理员admin表
        models.Admin = db.define('admin', {
            id: { type: 'serial', key: true },
            username: String,
            password: String
        })
        // 客户customer表
        models.Customer = db.define('customer', {
            id: { type: 'serial', key: true },
            username: String,
            password: String,
            cus_name: String,
            cus_tel: String,
            cus_place: String,
            active: Number
        })
        // 类别表
        models.Category = db.define('category', {
            id: { type: 'serial', key: true },
            category_name: String
        })
        //商品表
        models.Goods = db.define('goods', {
            id: { type: 'serial', key: true },
            category_id: Number,
            goods_name: String,
            goods_price: Number,
            goods_img: String,
            goods_details: String,
            goods_specifications: String,
            active: Number,
            create_time: String,
            update_time: String,
            inventory: Number,
            sales: Number
        })
        // 用户收藏商品表
        models.UserStart = db.define('userStart', {
            id: { type: 'serial', key: true },
            gid: Number,
            cid: Number,
            active: Number,
            create_time: String
        })
        // 用户购物车表
        models.ShopCar = db.define('shopCar', {
            id: { type: 'serial', key: true },
            gid: Number,
            cid: Number,
            count: Number,
            create_time: String,
            is_pay: Number
        })
        // 订单表
        models.Order = db.define('corder', {
            id: { type: 'serial', key: true },
            cid: Number,
            gid: Number,
            count: Number,
            unit_price: Number,
            total_price: Number,
            is_distribut: Number,
            is_cancel: Number,
            create_time: String
        })
    }

} )

exports.models = models