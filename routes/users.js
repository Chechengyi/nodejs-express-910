var express = require('express');
var router = express.Router();
var Model = require('../model/index').models
var dataBase = require('../model/index')
/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });
var arrToMySqlIn = require('../untils').arrToMySqlIn
var orderCode = require('../untils').orderCode

// 客户修改密码请求
router.post('/updatePsw', function (req, res) {
    var cid = req.body.cid
    var password = req.body.password
    Model.Customer.find({id: cid}).each( function (result) {
        result.password = password
    } ).save( function (err) {
        res.send(JSON.stringify({status: 'ok'}))
    } )
})

//用户收藏商品请求 或取消收藏商品请求  id 为用户已经收藏过的商品的商品表id
router.post('/star', function (req, res) {
    var cid = req.body.cid
    var gid = req.body.gid
    var type = req.body.type
    var id = req.body.id
    if (id) {
        Model.UserStart.find({id: id}).each( function (result) {
            result.active = result.active === 1? 0: 1
        } ).save( function (err) {
            res.send(JSON.stringify({status: 'ok'}))
        } )
    } else {
        if (!type) {
            res.send(JSON.stringify({status: 'error'}))
            return false
        }
        Model.UserStart.find({cid:cid, gid: gid}, function (err, data) {
            if (data.length === 0) {
                Model.UserStart.create({
                    cid: cid,
                    gid: gid,
                    active: 1,
                    create_time: new Date()
                }, function () {
                    res.send(JSON.stringify({status: 'ok'}))
                })
            } else {
                Model.UserStart.find({cid: cid, gid: gid}).each( function (result) {
                    // result.active = 1
                    if ( type === 'star' ) {
                        result.active = 1
                        result.create_time = new Date()
                    } else {
                        result.active = 0
                    }
                } ).save( function (err2) {
                    res.send(JSON.stringify({status: 'ok'}))
                } )
            }
        })
    }
})

// 客户添加购物车请求
router.post('/addShopCar', function (req, res) {
    var cid = req.body.cid
    var gid = req.body.gid
    var count = req.body.count
    Model.ShopCar.find({cid: cid, gid: gid, is_pay: 0}, function (err, data) {
        if (data.length === 0) {
          Model.ShopCar.create({
              cid: cid,
              gid: gid,
              count: count,
              is_pay: 0,
              create_time: new Date()
          }, function () {
              res.send(JSON.stringify({status: 'ok'}))
          })
        } else {
          Model.ShopCar.find({cid: cid, gid: gid}).each( function (result) {
              result.count += parseInt(count)
              result.create_time = new Date()
          } ).save( function (err2) {
              res.send(JSON.stringify({status: 'ok'}))
          } )
        }
    })
})

// 客户端更新购物车数量请求
router.post('/updateShopcar', function (req, res) {
    var sid = req.body.sid
    var count = req.body.count
    var gid = req.body.gid
    Model.ShopCar.find({id: sid, gid: gid}).each( function (result) {
        result.count = count
    } ).save( function (err) {
        res.send(JSON.stringify({
            status: 'ok'
        }))
    } )
})

//删除购物车选项  @参数  range  数组， 数组中的每一项是需要删除的购物车表id
router.post('/deleteShopcar', function (req, res) {
    var range = req.body.range
    var cid = req.body.cid
    var inStr = arrToMySqlIn(range)
    console.log(inStr)
    var select = 'delete from shopcar where cid = ' + cid + ' and id in ' + inStr
    dataBase.db.driver.execQuery(select, function (err) {
        res.send(JSON.stringify({
            status: 'ok'
        }))
    })
})

// 客户下单  购物车生成订单
router.post('/shopToOrder', function (req, res) {
    var cid = req.body.cid
    var range = req.body.range  // 数组， 数值中的每一项是需要购买的购物车的id
    var index = range.length  // 需要形成的订单条数
    var create_index = 0 // 已经形成的订单条数
    var inStr = arrToMySqlIn(range)
    var search_select = 'SELECT\n' +
        '\tgoods.id as gid,\n' +
        '\tshop.cid as cid,\n' +
        '\tshop.id as sid,\n' +
        '\tgoods.goods_price as goods_price,\n' +
        '\tshop.count as count\n' +
        'FROM\n' +
        '\tshopcar AS shop\n' +
        'INNER JOIN goods AS goods ON shop.gid = goods.id\n' +
        'WHERE\n' +
        '\tshop.id IN '+ inStr +' and shop.cid = ' + cid
    dataBase.db.driver.execQuery(search_select, function (err, data) {
        if ( data.length !== 0 ) {
            for ( var i=0; i<data.length; i++ ) {
                (function (i) {
                    Model.Order.create({
                        cid: data[i].cid,
                        gid: data[i].gid,
                        count: data[i].count,
                        unit_price: data[i].goods_price,
                        total_price: data[i].count * data[i].goods_price,
                        is_distribut: 0,
                        is_cancel: 0,
                        create_time: new Date()
                    }, function (err) {
                        if (err) {

                        } else {
                            Model.ShopCar.find( {id: data[i].sid} ).each( function (result) {
                                result.is_pay = 1
                            } ).save( function (err2) {
                                Model.Goods.find({id: data[i].gid}).each( function (goods) {
                                    goods.sales += data[i].count
                                    goods.inventory = (goods.inventory - data[i].count)>0?goods.inventory - data[i].count:0
                                } ).save( function (err2) {

                                } )
                            } )
                        }
                    })
                })(i)
            }
            res.send(JSON.stringify({status: 'ok'}))
        } else {
            res.send(JSON.stringify({status: 'error'}))
        }
    })
})

// 客户直接对着商品下单
router.post('/goodsToOrder', function (req, res) {
    var gid = req.body.gid
    var cid = req.body.cid
    var count = req.body.count
    // res.send(JSON.stringify({status: 'ok'}))
    var search_select = 'SELECT\n' +
        '\tgoods.id as gid,\n' +
        '\tgoods.goods_price as unit_price\n' +
        'FROM\n' +
        '\tgoods AS goods\n' +
        'WHERE\n' +
        '\tid = ' + gid
    dataBase.db.driver.execQuery(search_select, function (err, goods) {
        Model.Order.create({
            cid: cid,
            gid: gid,
            count: count,
            unit_price: goods[0].unit_price,
            total_price: count * goods[0].unit_price,
            is_distribut: 0,
            is_cancel: 0,
            create_time: new Date()
        }, function (err) {
            Model.Goods.find({id: gid}).each( function (result) {
                result.sales += count
                result.inventory = (result.inventory -count)>0?result.inventory - count:0
            } ).save( function (err2) {
                res.send(JSON.stringify({
                    status: 'ok'
                }))
            } )
        })
    })
})

// 客户获取收藏夹信息  带分页参数  page num
router.get('/getStar', function (req, res) {
    var cid = req.query.cid
    var page = req.query.page
    var num = req.query.num
    var select = 'SELECT\n' +
        '\tgoods.id as gid,\n' +
        '\tgoods.goods_name as goods_name,\n' +
        '\tgoods.goods_img as goods_img,\n' +
        '\tgoods.goods_price as goods_price,\n' +
        '\tstar.id as star_id\n' +
        'FROM\n' +
        '\tuserstart AS star\n' +
        'LEFT JOIN goods AS goods ON star.gid = goods.id\n' +
        'WHERE\n' +
        '\tstar.cid = '+cid+' and star.active = 1\n' +
        'ORDER BY\n' +
        'star.create_time DESC\n'
    if (num&&page) {
        select += ' LIMIT ' + num + ' OFFSET ' + page
    }
    dataBase.db.driver.execQuery(select, function (err, data) {
        res.send(JSON.stringify(data))
    })
})

module.exports = router;
