var express = require('express');
var router = express.Router();
var Model = require('../model/index').models
var arrToMySqlIn = require('../untils').arrToMySqlIn
var dataBase = require('../model/index')
var multer = require('multer');
var fs = require('fs')
var rootPath = require('../rootPath')
var storage = multer.diskStorage({
    //设置上传后文件路径，uploads文件夹会自动创建。
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    //给上传文件重命名，获取添加后缀名
    filename: function (req, file, cb) {
        var fileFormat = (file.originalname).split(".");
        cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
    }
});
var upload = multer({
    storage: storage
})

// 添加客户账户请求
router.post('/addCus', function (req, res) {
    var username = req.body.username
    // 先查询登录账户是否重复
    Model.Customer.find({username: username}, function (err, cus) {
        if (cus.length !==0) {
            res.send(JSON.stringify({
                status: 'exist'
            }))
        } else {
            var cus_name = req.body.cus_name
            var cus_tel = req.body.cus_tel
            var cus_place = req.body.cus_place
            Model.Customer.create({
                username: username,
                password: '000000',
                cus_name: cus_name,
                cus_tel: cus_tel,
                cus_place: cus_place,
                active: 1
            }, function (err) {
                res.send(JSON.stringify({status: 'ok'}))
            })
        }
    })
    // 不重复执行添加账户操作

})
// 管理员修改用户信息
router.post('/updateCus', function (req, res) {
    var id = req.body.id
    var cus_name = req.body.cus_name
    var cus_tel = req.body.cus_tel
    var cus_place = req.body.cus_place
    var active = req.body.active
    Model.Customer.find({id: id}).each( function (cus) {
        cus.cus_name = cus_name
        cus.cus_tel = cus_tel
        cus.cus_place = cus_place
        cus.active = active
    } ).save( function (err) {
        res.send(JSON.stringify({status: 'ok'}))
    } )
})
// 管理员添加商品类别请求
router.post('/addCategory', function (req, res) {
    var category_name = req.body.category_name
    console.log(category_name)
    Model.Category.create({ category_name: category_name }, function (err) {
        res.send(JSON.stringify({status: 'ok'}))
    })
})
// 管理员添加商品请求
router.post('/addGoods',upload.single("goods_img"), function (req, res) {
    var image = req.file.path
    var newPath = 'uploads/' + req.file.originalname
    fs.rename(image, newPath, function (err) {
        if (err) {
            throw (err)
        } else {
            var goods_name = req.body.goods_name
            var goods_price = req.body.goods_price
            var category_id = req.body.category_id
            var goods_details = req.body.goods_details
            var goods_specifications = req.body.goods_specifications
            var inventory = req.body.inventory
            Model.Goods.create({
                category_id: category_id,
                goods_name: goods_name,
                goods_price: goods_price,
                goods_img: rootPath + '/' + newPath,
                goods_details: goods_details,
                goods_specifications: goods_specifications,
                active: 1,
                inventory: inventory || 0,
                create_time: new Date()
            }, function (err) {
                if (err) {
                    res.send(JSON.stringify({status: 'error'}))
                } else {
                    res.send(JSON.stringify({status: 'ok'}))
                }
            })
        }
    })
})
// 管理员修改商品图片请求
router.post('/updateGoodsImg', upload.single("goods_img"), function (req, res) {
    var id = req.body.id
    var image = req.file.path
    var newPath = 'uploads/' + req.file.originalname
    fs.rename(image, newPath, function (err) {
        if (err) {
            throw err
        } else {
            Model.Goods.find({id:id}).each( function (goods) {
                goods.goods_img = rootPath + '/' + newPath
            } ).save( function (err2) {
                res.send(JSON.stringify({status: 'ok'}))
            } )
        }
    })
})
// 管理员修改商品信息请求
router.post('/updateGoods', function (req, res) {
    var goods_name = req.body.goods_name
    var goods_price = req.body.goods_price
    var category_id = req.body.category_id
    var goods_details = req.body.goods_details
    var goods_specifications = req.body.goods_specifications
    var active = req.body.active
    var id = req.body.id
    Model.Goods.find({id:id}).each( function (goods) {
        if (goods_name) {
            goods.goods_name = goods_name
        }
        if (goods_price) {
            goods.goods_price = goods_price
        }
        if (category_id) {
            goods.category_id = category_id
        }
        if (goods_details) {
            goods.goods_details = goods_details
        }
        if (goods_specifications) {
            goods.goods_specifications = goods_specifications
        }
        if (active||active===0) {
            goods.active = active
        }
    } ).save( function (err) {
        res.send(JSON.stringify({
            status: 'ok'
        }))
    } )
})
// 管理员修改商品库存 参数： type 入库操作还是出库操作  num： 数量  id 操作商品id
router.post('/updateGoodsInventory', function (req, res) {
    var id = req.body.id
    var num = parseInt(req.body.num)
    var type = req.body.type
    Model.Goods.find({id: id}).each( function (goods) {
        if (type === 'ru') {
            goods.inventory += num
        } else {
            goods.inventory -= num
            goods.inventory = goods.inventory < 0? 0:goods.inventory
        }
    } ).save( function (err) {
        res.send(JSON.stringify({
            status: 'ok'
        }))
    } )
})
// 管理员设置订单发货
router.post('/delivery', function (req, res) {
    var range = req.body.range
    var inStr = arrToMySqlIn(range)
    var select = 'UPDATE corder\n' +
        'SET corder.is_distribut = 1\n' +
        'WHERE\n' +
        '\tcorder.id IN ' + inStr
    dataBase.db.driver.execQuery( select, function (err,data) {
        res.send(JSON.stringify({
            status: 'OK'
        }))
    } )
})

module.exports = router;