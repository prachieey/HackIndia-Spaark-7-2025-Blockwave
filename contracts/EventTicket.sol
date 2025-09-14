// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EventTicket {
    struct Event {
        uint256 id;
        string name;
        string location;
        uint256 date;
        uint256 price;
        uint256 ticketsAvailable;
        address organizer;
    }

    struct Ticket {
        uint256 eventId;
        address owner;
        bool isUsed;
    }

    uint256 public nextEventId;
    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket[]) public eventTickets;
    mapping(address => uint256[]) public userTickets;

    event EventCreated(uint256 indexed eventId, string name, address indexed organizer);
    event TicketPurchased(uint256 indexed eventId, address indexed buyer, uint256 ticketId);
    event TicketUsed(uint256 indexed eventId, uint256 indexed ticketId, address indexed user);

    function createEvent(
        string memory name,
        string memory location,
        uint256 date,
        uint256 price,
        uint256 ticketsAvailable
    ) public {
        events[nextEventId] = Event({
            id: nextEventId,
            name: name,
            location: location,
            date: date,
            price: price,
            ticketsAvailable: ticketsAvailable,
            organizer: msg.sender
        });
        emit EventCreated(nextEventId, name, msg.sender);
        nextEventId++;
    }

    function purchaseTicket(uint256 eventId) public payable {
        Event storage e = events[eventId];
        require(e.ticketsAvailable > 0, "No tickets left");
        require(msg.value >= e.price, "Insufficient payment");
        e.ticketsAvailable--;
        Ticket memory t = Ticket({eventId: eventId, owner: msg.sender, isUsed: false});
        eventTickets[eventId].push(t);
        userTickets[msg.sender].push(eventId);
        emit TicketPurchased(eventId, msg.sender, eventTickets[eventId].length - 1);
    }

    function useTicket(uint256 eventId, uint256 ticketId) public {
        Ticket storage t = eventTickets[eventId][ticketId];
        require(t.owner == msg.sender, "Not ticket owner");
        require(!t.isUsed, "Ticket already used");
        t.isUsed = true;
        emit TicketUsed(eventId, ticketId, msg.sender);
    }

    function getEvent(uint256 eventId) public view returns (Event memory) {
        return events[eventId];
    }

    function getTicketsOfUser(address user) public view returns (uint256[] memory) {
        return userTickets[user];
    }

    function getTicketsForEvent(uint256 eventId) public view returns (Ticket[] memory) {
        return eventTickets[eventId];
    }
}
