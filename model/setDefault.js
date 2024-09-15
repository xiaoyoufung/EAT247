const listItem = require("./listItem");
const Category = listItem.Category;
const Food = listItem.Food;
const Status = listItem.Status;

// All default categories
const pizza = new Category({ name: "Pizza", icon: "pizza-slice" });
const appetizer = new Category({ name: "Appetizer", icon: "bread-slice" });
const chicken = new Category({ name: "Chicken", icon: "drumstick-bite" });
const pasta = new Category({ name: "Pasta", icon: "wheat-awn" });
const drinks = new Category({ name: "Drinks", icon: "bottle-water" });

// categories
const setCategory = () => {

  const defaultCategories = [pizza, appetizer, chicken, pasta, drinks];

  Category.insertMany(defaultCategories)
    .then(() => console.log("Add all the categories succussfuly"))
    .catch((err) => console.log(err));
};

// foods
const setFood = () => {
  // All default foods
  const pizza1 = new Food(
    {
        name: "Chicken Trio",
        description: "BBQ Chicken, Garlic Buttered Chicken, Roasted Chicken, Mushroom, Red&Green Chili and Pizza Sauce",
        category: pizza,
        price: 19.90
      });

  const pizza2 = new Food(
    {
        name: "Seafood Cocktail",
        description: "Shrimp, Crab Sticks, Ham, Pineapple and Thousand Island Sauce",
        category: pizza,
        price: 23.90
      });

  const pizza3 = new Food(
    {
        name: "Double Pepperoni",
        description: "Pepperoni and Pizza Sauce",
        category: pizza,
        price: 22.90
      });

  const pizza4 = new Food(
    {
        name: "Hawaiian",
        description: "Ham, Bacon, Pineapple and Pizza Sauce",
        category: pizza,
        price: 21.90
      });

  const pizza5 = new Food(
    {
        name: "Meat Deluxe",
        description: "Ham, Bacon, Pepperoni, Smoked Sausage, Italian Sausage, Bacon Dice and Pizza Sauce",
        category: pizza,
        price: 25.90
      });

  const pizza6 = new Food(
    {
        name: "Tom Yum Kung",
        description: "Shrimp, Squid, Mushroom and Tom Yum Sauce",
        category: pizza,
        price: 25.90
      });

  const pasta1 = new Food(
    {
        name: "Ham & Mushroom Spaghetti in Alfredo Sauce",
        category: pasta,
        price: 17.90
      });
  const pasta2 = new Food(
    {
        name: "Pork Bolognese",
        category: pasta,
        price: 16.90
      });
  const chicken1 = new Food(
    {
        name: "Honey Chicken Wings",
        category: chicken,
        price: 15.90
      });
  const chicken2 = new Food(
    {
        name: "BBQ Chicken Wings",
        category: chicken,
        price: 16.90
      });
  const appetizer1 = new Food(
    {
        name: "Cheese Sticks",
        category: appetizer,
        price: 14.90
      });
  const appetizer2 = new Food(
    {
      name: "Calamari",
      category: appetizer,
      price: 13.90
    });
  const drink1 = new Food(
    {
      name: "Coke",
      category: drinks,
      price: 5.90
    });
  const drink2 = new Food(
    {
      name: "Coke (NO SUGAR)",
      category: drinks,
      price: 6.90
    });

  const defaultFoods = [pizza1, pizza2, pizza3, pizza4, pizza5, pizza6, pasta1, pasta2, chicken1, chicken2, appetizer1, appetizer2, drink1, drink2];

  Food.insertMany(defaultFoods)
    .then(() => console.log("Add all the foods succussfuly"))
    .catch((err) => console.log(err));
};

// order status
const setOrderStatus = () => {

  // All default order's status
  const queue = new Status({name: "Queue", status: "Order placed", description: "We are now preparing your Pizza"});
  const cook = new Status({name: "Cook", status: "Order cooked", description: "We are now baking your Pizza"});
  const delivery = new Status({name: "Delivery", status: "Order deliverd", description: "We are now delivering your Pizza"});
  const complete = new Status({name: "Complete", status: "Order completed", description: "Your order is complete"});

  const defaultStatus = [queue, cook, delivery, complete];

  Status.insertMany(defaultStatus)
    .then(() => console.log("Add all the order's status succussfuly"))
    .catch((err) => console.log(err));
}

// add all default item to dataBase
exports.setDefaultAll = () => {
  setCategory();
  setFood();
  setOrderStatus();
}
