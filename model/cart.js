module.exports = function Cart(oldCart) {
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;

    // add item by click add to cart
    this.add = function(item, id) {
        let storeItem = this.items[id];
        if(!storeItem) {
            storeItem = this.items[id] = {item: item, qty: 0, price: 0};
        }
        storeItem.qty++;
        storeItem.price = storeItem.item.price * storeItem.qty;
        this.totalQty++;
        this.totalPrice += storeItem.item.price;
    };

    // click minus btn in shopping cart
    this.reduceByOne = function(id) {
        this.items[id].qty--;
        this.items[id].price -= this.items[id].item.price;
        this.totalQty--;
        this.totalPrice -= this.items[id].item.price;

        if(this.items[id].qty <= 0) {
            delete this.items[id];
        }
    }

    // click plus btn in shopping cart
    this.increaseByOne = function(id) {
        this.items[id].qty++;
        this.items[id].price += this.items[id].item.price;
        this.totalQty++;
        this.totalPrice += this.items[id].item.price;
    }

    // click delete btn in shopping cart
    this.removeItem = function(id) {
        this.totalQty -= this.items[id].qty;
        this.totalPrice -= this.items[id].price;
        delete this.items[id]
    }

    // add individule item to cart
    this.addIndividule = function(item, id, quantity) {
        let storeItem = this.items[id];
        if(!storeItem) {
            storeItem = this.items[id] = {item: item, qty: 0, price: 0};
        }
        storeItem.qty = quantity;
        storeItem.price = storeItem.item.price * storeItem.qty;
        this.totalQty += storeItem.qty;
        this.totalPrice += storeItem.price;
    };

    this.generateArray = function() {
        let arr = [];
        for(var id in this.items) {
            arr.push(this.items[id])
        }
        return arr;
    };
};