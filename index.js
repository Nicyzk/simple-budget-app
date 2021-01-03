
//DOMstrings object
let DOMstrings = {
    inputType: "form-incexp",
    inputDescription: "form-description",
    inputValue: "form-value",
    inputBtn: "form-checkbox-icon"
}

//Budget Controller Module 

function createBudgetController() {

    //Data Object should be a private variable 
    let data = {
        instances: {
            inc: [],
            exp: []
        },

        budget: {
            totalIncome: 0,
            totalExpenses: 0,
            balance: 0,
            percentage: -1
        }
    };

    let Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }
    
    let Expense = function (id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    

    return {
        addItemToData: function(type, description, value){
            let item;
            let ID;
            //have to take into account that items may be deleted later which may result in gaps in numbers in array
            if(data.instances[type][0]){
                ID = data.instances[type][data.instances[type].length-1].id + 1;
            } 
            else {
                ID = 1;
            }
            
            if (type == 'inc'){
                item = new Income(ID, description, parseFloat(value));
            }
            else if (type == 'exp'){
                item = new Expense(ID, description, parseFloat(value));
            }
            data.instances[type].push(item);
            return item;
        },

        addListItemtoUI: function(obj, type){
            //create HTML string with placeholder text
            let html;
            if (type == "inc"){
                html = '<div class="bottom-item" id="inc-%id%">'+
                            '<div>%description%</div>'+
                            '<div class="bottom-item-amt" id="bottom-inc-amt">%value%</div>'+
                            '<button class="delete-btn"><i class="ion-ios-close-outline"></i></button>'+
                        '</div>';
            }
            else if (type == "exp"){
                html = '<div class="bottom-item" id="exp-%id%">' +
                            '<div>%description%</div>'+
                            '<div id="bottom-exp-value-percentage-box">'+
                                '<div class="bottom-item-amt">%value%</div>'+
                                '<div class="budget-percentage exp-budget-percentage">%percentage%</div>'+
                            '</div>'+
                            '<button class="delete-btn"><i class="ion-ios-close-outline"></i></button>'+
                        '</div>';
            }
            //Note js strings must all be on a single line unless you concatenate (+ or \) 

            //replace html with actual data from obj passed
            html = html.replace('%id%', obj.id);
            html = html.replace('%description%', obj.description);
            html = html.replace('%value%', obj.value.toFixed(2));

            //insert the html into the dom using adjacenthtml 
            
            document.getElementById("bottom-"+type).insertAdjacentHTML('beforeend', html);
        },

        calculateBudget: function() {
            // calculate total income and total expenses 
            data.budget.totalIncome = data.instances.inc.reduce((a,b)=>a+b.value, 0);
        
            data.budget.totalExpenses = data.instances.exp.reduce((a,b)=>a+b.value, 0);
            
            // work out percentage of total expenses over total income as long as income not 0 WHEN ADDING
            if (data.budget.totalIncome > 0){
                data.budget.percentage =  Math.round(data.budget.totalExpenses/data.budget.totalIncome*100);
            }
            else{
                data.budget.percentage = -1;
            }

            data.budget.balance = data.budget.totalIncome - data.budget.totalExpenses;

            return data.budget;
            
            // in addListitem to UI give the percentage of that one elements expense/total income
            // return a budget so that update budget in controller can update UI 
        },

        addBudgetToUI: function(budget){

            //toFixed converts floating number to a string with 2 dp
            if(budget.balance >= 0){
                document.getElementById("budget-balance").innerHTML = "+ " + budget.balance.toFixed(2);
            }
            else {
                document.getElementById("budget-balance").innerHTML = "- " + (-budget.balance).toFixed(2);
            }
             
            document.getElementById("budget-inc-balance").innerHTML = "+ " + budget.totalIncome.toFixed(2);
            document.getElementById("budget-exp-balance").innerHTML = "- " + budget.totalExpenses.toFixed(2);
            
            if(budget.percentage > 0){
                document.getElementById("top-budget-percentage").innerHTML = budget.percentage + "%";
            }
            else{
                document.getElementById("top-budget-percentage").innerHTML = 0 + "%";
            }
        },

        updateBudget: function(){
            let budget = this.calculateBudget();
            this.addBudgetToUI(budget);
        },

        deleteItemFromData: function(type, id){
            //look into data based on type and delete item from array using splice
            data.instances[type] = data.instances[type].filter(a=>a.id != id);
        },

        deleteItemFromUI: function(id){
            document.getElementById(id).remove();
        },

        updatePercentage(){
            //Note you have to update ALL percentages every time you add/delete a new item to budget

            //create array with percentage of each exp item in the order of items in exp 
            let expPercentageArr = data.instances.exp.map(a => {
                if (data.budget.totalIncome > 0){
                    return Math.round(a.value/data.budget.totalIncome*100)
                }
                else {
                    return 0;
                }
            });

            //loop through all exp items IN ORDER and replace html string again
            let listOfBudgetPercentages = document.getElementsByClassName("exp-budget-percentage");
            for (let i = 0; i < expPercentageArr.length; i++){
                listOfBudgetPercentages[i].innerHTML = expPercentageArr[i] + "%";
            }
        },

        testing: function(){
            return data;
        }
    }

};

let budgetController = createBudgetController();

//End of Budget Controller Module


//UI Controller Module 

function createUIController() {
    return {
        getInput: function() {
            let type = document.getElementById(DOMstrings.inputType).value; //For a select element, its value attribute will be the option that is selected by the user.
            let description = document.getElementById(DOMstrings.inputDescription).value; //For any input element, its value attribute will be the text/input given by the user.
            let value = document.getElementById(DOMstrings.inputValue).value//same as above
            return {
                type, description, value //object es6 shorthand
            }
        },

        clearFields: function() {
            let list = document.getElementsByTagName("input");
            for (let i of list){
                i.value = "";
            }
            //document.getElementById("form-incexp").value = "inc";
        },

        displayDate: function(){
            let date = new Date();
            let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            
            document.getElementById("budget-title").innerHTML = "Available Balance in " + months[date.getMonth()] + " " + date.getFullYear();
        },

        changeTypeFocusColor: function(){
            let focusElements  = document.getElementsByClassName("form-change-focus-ontype");
            for (let i = 0;  i < focusElements.length; i++){
                focusElements[i].classList.toggle("red-focus");
            }

            document.getElementById("form-checkbox-icon").classList.toggle("red");
        }
    };
};

let UIController = createUIController();





//Controller Function Definitions

function Controller(BudgetCtrl, UICtrl) {


    let ctrlAddItem = function(){
        
        //Get the field input data
        let input = UIController.getInput();

        //Make sure that input is not empty or 0 in either description or value 
        if (input.description != "" && input.value != "" && parseInt(input.value) != 0){

            //Add the item to their respective arrays in data Note that addItemToData returns the ID of the item
            let newItem = budgetController.addItemToData(input.type, input.description, input.value);

            //Add the item to the UI
            budgetController.addListItemtoUI(newItem, input.type);

            //Clear fields
            UIController.clearFields();

            //Update Budget and then add it to UI
            budgetController.updateBudget();

            //Update Percentage
            budgetController.updatePercentage();
        }
    };

    let setEventListeners = function() {
        document.getElementById(DOMstrings.inputBtn).addEventListener("click", ()=>{
            ctrlAddItem();
        });
    
        document.getElementById("middle").addEventListener("keydown", (event)=>{
            if(event.keyCode===13){
                ctrlAddItem();
            }
        });

        document.getElementById("bottom").addEventListener("click", ctrlDeleteItem);

        document.getElementById("form-incexp").addEventListener("change", UIController.changeTypeFocusColor);


    }
    
    let ctrlDeleteItem = function(event){
        let type, id, splitID, itemID;
        if(event.target.tagName == "I"){
            itemID = event.target.parentNode.parentNode.id; 
            if (itemID){
                splitID = itemID.split("-");
                type = splitID[0];
                id = splitID[1];
            }

            //delete item from data structure
            budgetController.deleteItemFromData(type, id);
            //delete item from UI
            budgetController.deleteItemFromUI(itemID);
            //update budget
            budgetController.updateBudget();
            //update percentage
            budgetController.updatePercentage();
        }
        
        //must ensure that target's tag name is i 
        //otherwise for exp clicking on amt and % will give same parentNode
    };

    return {
        init: function() {
            console.log("application is working!");
            setEventListeners();
            UIController.displayDate();
        }
    }
}

/*Note: When you add a keydown event to an element, the event object is only sent when the key is pressed while
the element is in FOCUS and only certain items like input fields are focusable. Eg a div is not focusable.*/



//Execution Code
Controller(budgetController, UIController).init();

