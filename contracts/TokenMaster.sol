// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract TokenMaster is ERC721 {

    address public owner;
    uint256 public totalSupply;
    uint256 public totalOccasions;

    struct Occasion{
        uint256 id;
        string name;
        uint256 price;
        uint256 tickets;
        uint256 maxTickets;
        string location;
        string time;
        string date;
    }

    mapping(uint256 => Occasion) occasions;
    mapping(uint256 => mapping(address => bool)) public hasBought;
    mapping(uint256 => mapping(uint256 => address)) public seatTaken;
    mapping(uint256 => uint256[]) seatsTaken;

    
    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        owner = msg.sender;
    }

    // creates occasion by taking variables of occasion as inputs
    // only the owner of contract can use it
    function list(
        string memory _name,
        uint256 _price,
        uint256 _maxTickets,
        string memory _location,
        string memory _time,
        string memory _date
    ) public onlyOwner {
        totalOccasions++;
        occasions[totalOccasions] = Occasion(
            totalOccasions,
            _name,
            _price,
            _maxTickets,
            _maxTickets,
            _location,
            _time,
            _date
        );

    }

    function mint(uint256 _id, uint256 _seat) public payable {
        // Occasion id check
        require(_id != 0);
        require(_id <= totalOccasions);
        
        // Occasion cost check
        require(msg.value >= occasions[_id].price);

        // Seat not taken check and seat exists check
        require(seatTaken[_id][_seat] == address(0));
        require(_seat <= occasions[_id].maxTickets);
        
        // update ticket count
        occasions[_id].tickets -= 1; 

        hasBought[_id][msg.sender] = true; // update buying status
        seatTaken[_id][_seat] = msg.sender; // assign seat

        seatsTaken[_id].push(_seat); // update seats currently taken 

        totalSupply++;
        _safeMint(msg.sender, totalSupply);
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }

    function getOccasion(uint256 _id) public view returns(Occasion memory) {
        return occasions[_id];
    }

    function getSeatsTaken(uint256 _id) public view returns (uint256 [] memory) {
        return seatsTaken[_id];
    }


    function getAddress() public view returns(address) {
        return address(this);
    }
   
}



