// globals
var Bank;
var Market;



// registration
Game.registerMod("trading1", {
	init:function(){
        Game.Notify(`First Trading Mod Loaded!`,'',[16,5]);
        Game.registerHook('create', function(){Bank = Game.Objects['Bank'];});
        var totalPortfolioValue = 0;

        var MOD = this;
        Game.registerHook('logic', function(){ if (Bank.minigameLoaded) {
            Market = Bank.minigame;
            const dragonBoost = Game.auraMult('Supreme Intellect');
            const overhead = 1+0.01*(20*Math.pow(0.95,Market.brokers));
            var portfolioValue = 0;

            for (let id = 0; id < Market.goodsById.length; id++) {
                var good = Market.goodsById[id];
                var expectedPrice = MOD.getPrice(id);
                var mode = good.mode;

                var expectedDelta = good.d * (0.97+0.01*dragonBoost);
                
                if (mode == 0) {expectedDelta *= 0.95;}
                if (mode == 1) {expectedDelta *= 0.99; expectedDelta += 0.02;}
                if (mode == 2) {expectedDelta *= 0.99; expectedDelta -= 0.02;}
                if (mode == 3) {expectedPrice += 2.5; expectedDelta += 0.06;}
                if (mode == 4) {expectedPrice -= 2.5; expectedDelta -= 0.06;}

                expectedPrice += (Market.getRestingVal(id)-expectedPrice)*0.01;

                
                if (mode == 3) {expectedPrice -= 0.6; expectedPrice += 0.018;}
                if (mode == 4) {expectedPrice += 0.6;}

                if (expectedPrice > (100 + (Bank.level - 1) * 3) && expectedDelta > 0) expectedDelta *= 0.9;

                expectedPrice += expectedDelta;


                if (expectedPrice < 5) expectedPrice += (5 - expectedPrice) * 0.5;
			    expectedPrice = Math.max(expectedPrice,1);


                if (mode != -1) {
                    if (MOD.getPrice(id) * overhead < expectedPrice && good.stock == 0) MOD.purchase(id);
                    else if (MOD.getPrice(id) > expectedPrice && good.stock > 0) MOD.liquidate(id);
                }


                portfolioValue += good.stock * MOD.getPrice(id);
            }
            totalPortfolioValue = portfolioValue + Market.profit;

            // NAV (Net Asset Value) Tracker
            if (!l('trader1ValueTracker')) l('bankBalance').parentElement.innerHTML = "NAV: <span id=trader1ValueTracker></span>. " + l('bankBalance').parentElement.innerHTML;
            const nAV = l('trader1ValueTracker');
            nAV.innerText = (totalPortfolioValue<0?'-':'')+'$'+Beautify(Math.abs(totalPortfolioValue),2);;
			if (totalPortfolioValue>0) {nAV.classList.add('bankSymbolUp');nAV.classList.remove('bankSymbolDown');}
			else if (totalPortfolioValue<0) {nAV.classList.add('bankSymbolDown');nAV.classList.remove('bankSymbolUp');}
        }});
	},
	save:function(){

	},
	load:function(str){

	},

    // EFFECTS: Rounds value x to a USD
    dollarRounder:function(x) {return Math.round(x*100)/100},

    // REQUIRES: Market != null
    // MODIFIES: Market
    // EFFECTS: Purchases the maximum amount of the good whose id is "id"
    purchase:function(id){Market.buyGood(id, 10000)},

    // REQUIRES: Market != null
    // MODIFIES: Market
    // EFFECTS:  Sells the maximum amount of the good whose id is "id"
    liquidate:function(id){Market.sellGood(id, 10000)},


    // REQUIRES: Market != null
    // EFFECTS: Returns the price (rounded as USD) associated with the good whose id is "id"
    getPrice:function(id){return Market.getGoodPrice(Market.goodsById[id]);},

});