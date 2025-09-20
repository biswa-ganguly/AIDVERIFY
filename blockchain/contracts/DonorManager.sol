// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

contract DonorManager {
    struct Donor {
        bytes15 donorId;
        string donorUserName;
        bool isVerified;
    }

    mapping(string => Donor) private donorsByName; // username → donor
    uint256 private idCounter;

    // Generate a safe 15-byte donorId
    function donorIdGenerator() private returns (bytes15) {
        idCounter++;
        // Combine counter with sender and hash to fit 15 bytes
        bytes32 hash = keccak256(abi.encodePacked(idCounter, msg.sender));
        bytes15 donorId;
        assembly {
            donorId := shr(8, hash) // take first 15 bytes
        }
        return donorId;
    }

    // Add a donor
    function addDonor(string memory _donorUserName, bool _isVerified) public {
        require(bytes(_donorUserName).length > 0, "Username cannot be empty");
        require(donorsByName[_donorUserName].donorId == bytes15(0), "Username already exists");

        bytes15 newId = donorIdGenerator();

        Donor memory newDonor = Donor({
            donorId: newId,
            donorUserName: _donorUserName,
            isVerified: _isVerified
        });

        donorsByName[_donorUserName] = newDonor;
    }

    // Get donor details by username
    function getDonorDetails(string memory _username) public view returns (bytes15, string memory, bool) {
        Donor memory d = donorsByName[_username];
        
        // Check if the donorId is its default value (0x0)
        if (d.donorId == bytes15(0)) {
            // Return default values if the donor is not found
            return (bytes15(0), "", false); 
        }
        
        // Otherwise, return the actual donor details
        return (d.donorId, d.donorUserName, d.isVerified);
    }
}
