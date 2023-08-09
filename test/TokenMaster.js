const {expect} = require("chai");
const {ethers} = require("hardhat");

const NAME = "TokenMaster";
const SYMBOL = "TM";

const OCCASION_NAME = "ETH Texas"
const OCCASION_COST = ethers.parseEther("1");
const OCCASION_MAX_TICKETS = 100
const OCCASION_DATE = "Apr 27"
const OCCASION_TIME = "10:00AM CST"
const OCCASION_LOCATION = "Austin, Texas"

describe("TokenMaster", function(){
    let tokenMaster
    let deployer, buyer

    beforeEach(async ()=> {
        //Setup Accounts
        [deployer, buyer] = await ethers.getSigners()

        const TokenMaster = await ethers.getContractFactory("TokenMaster");
        tokenMaster = await TokenMaster.deploy(NAME, SYMBOL);

        // .connect specifies which account does the transaction 
        const transaction = await tokenMaster.connect(deployer).list(
            OCCASION_NAME,
            OCCASION_COST,
            OCCASION_MAX_TICKETS,
            OCCASION_LOCATION,
            OCCASION_TIME,
            OCCASION_DATE
        );

        await transaction.wait();
    });

    describe("Deployment", ()=>{
        it("sets the name", async()=>{
            let name = await tokenMaster.name();
            expect(name).to.equal(NAME);
        });

        it("sets the symbol", async ()=>{
            let symbol = await tokenMaster.symbol();
            expect(symbol).to.equal(SYMBOL);
        });

        it("sets the owner", async ()=>{
            let owner = await tokenMaster.owner();
            expect(owner).to.equal(deployer.address);
        });
    });

    describe("Occasions", ()=> {
        it ("Updates occasions count", async() => {
            const totalOccasions = await tokenMaster.totalOccasions(); 
            expect(totalOccasions).to.be.equal(1);
        });

        it ("Returns occasions attributes", async()=>{
            const occasion = await tokenMaster.getOccasion(1);
            expect(occasion.id).to.be.equal(1);
            expect(occasion.name).to.be.equal(OCCASION_NAME);
            expect(occasion.price).to.be.equal(OCCASION_COST);
            expect(occasion.tickets).to.be.equal(OCCASION_MAX_TICKETS);
            expect(occasion.date).to.be.equal(OCCASION_DATE);
            expect(occasion.location).to.be.equal(OCCASION_LOCATION);
            expect(occasion.time).to.be.equal(OCCASION_TIME);


            

        });
    })

    describe("Minting", ()=>{
        const ID = 1;
        const SEAT = 50;
        const AMOUNT = ethers.parseEther("1");


        beforeEach(async () =>{
            const transaction = await tokenMaster.connect(buyer).mint(ID, SEAT, {value: AMOUNT});
            await transaction.wait();
        });

        it("Updates ticket count", async() => {
            const occasion = await tokenMaster.getOccasion(1);
            expect(occasion.tickets).to.be.equal(OCCASION_MAX_TICKETS - 1);
        })

        it("Updates buying status", async() => {
            const status = await tokenMaster.hasBought(ID, buyer.address);
            expect(status).to.be.equal(true);
        })

        it("Update seat status", async() => {
            const status = await tokenMaster.seatTaken(ID, SEAT);
            expect(status).to.be.equal(buyer.address);
        })

        it("Updates taken seats", async() => {
            const seats = await tokenMaster.getSeatsTaken(ID);
            expect(seats.length).to.be.equal(1);
            expect(seats[0]).to.be.equal(SEAT);
        })

        // Write a balance check test 
        it("Updates the contract balance", async ()=>{
            const address = await tokenMaster.getAddress();
            const addressString = address.toString();
            const balance = await ethers.provider.getBalance(addressString);
            expect(balance).to.be.equal(AMOUNT);
        });
    })

    describe("Withdraw", () => {
        const ID = 1;
        const SEAT = 50;
        const AMOUNT = ethers.parseEther("1");
        let balanceBefore

        beforeEach(async () =>{
            balanceBefore = await ethers.provider.getBalance(deployer.address);
            
            let transaction = await tokenMaster.connect(buyer).mint(ID, SEAT, {value:AMOUNT});
            await transaction.wait();

            transaction = await tokenMaster.connect(deployer).withdraw();
            await transaction.wait();
        });
        
        it("Updates the owner balance", async ()=>{
            const balanceAfter = await ethers.provider.getBalance(deployer.address);
            expect(balanceAfter).to.be.greaterThan(balanceBefore);
            
        });

        it("Updates the contract balance", async ()=>{
            const address = await tokenMaster.getAddress();
            const addressString = address.toString();
            const balance = await ethers.provider.getBalance(addressString);
            expect(balance).to.be.equal(0);
        });
    })

    

});