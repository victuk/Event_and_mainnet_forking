// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "hardhat/console.sol";

contract EventContract {
    uint256 eventID;

    enum EventStatus {
        pending,
        ongoing,
        completed,
        cancelled
    }

    struct UserDetails {
        string name;
        address urlAddress;
    }

    struct Event {
        string name;
        string venue;
        string dateAndTime;
        string nftUrl;
        address eventCreator;
        EventStatus eventStatus;
        UserDetails[] eventAtendees;
    }

    mapping (uint => Event) events;


    event EventCreated(uint eventId, address creator, string eventName);
    event NewAttendee(uint eventId, address attendee);

    // user address -> event ID -> nft ID
    mapping (address => mapping(uint => string)) attendees;

    function createEvent(string memory _name, string memory _venue, string memory _dateAndTime, string memory _nftUrl) external {
        eventID += 1;

    Event storage newEvent = events[eventID];
    
            newEvent.name = _name;
            newEvent.venue = _venue;
            newEvent.dateAndTime = _dateAndTime;
            newEvent.nftUrl = _nftUrl;
            newEvent.eventCreator = msg.sender;
            newEvent.eventStatus = EventStatus.pending;
            // newEvent.eventAdmins = address memory[];
            // newEvent.eventAtendees = address memory[];
        

        emit EventCreated(eventID, msg.sender, _name);
    }

    function registerForAnEvent(string memory _name, uint256 _eventID, string memory _nftUrl) external {
        require(events[eventID].eventStatus == EventStatus.pending || events[eventID].eventStatus == EventStatus.ongoing, "You can't register for this event anymore.");

        events[_eventID].eventAtendees.push(UserDetails({
            name: _name,
            urlAddress: msg.sender
        }));

        attendees[msg.sender][_eventID] = _nftUrl;

        emit NewAttendee(_eventID, msg.sender);

    }

    function changeEventStatus(uint _eventID, EventStatus _eventStatus) external {

        require(msg.sender == events[_eventID].eventCreator, "Only owner can take this action");

        events[_eventID].eventStatus = _eventStatus;

    }

    function getEventDetails(uint _eventID) external view returns (Event memory) {
        return events[_eventID];
    }

    
}