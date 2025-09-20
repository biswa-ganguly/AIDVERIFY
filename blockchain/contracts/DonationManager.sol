// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

contract DonationManager {
    struct Donation {
        string donationId;
        string campaignId;
        bytes15 donorId;
        string donorUserName;
        uint256 amount;
        string proofHash;
        uint256 timestamp;
    }

    Donation[] private donations;

    // Make a donation using the MongoDB transactionId
    function donate(
        string memory transactionId, // Now takes a transactionId as input
        string memory campaignId,
        bytes15 donorId,
        string memory donorUserName,
        uint256 amount,
        string memory proofHash
    ) public {
        donations.push(Donation({
            donationId: transactionId,
            campaignId: campaignId,
            donorId: donorId,
            donorUserName: donorUserName,
            amount: amount,
            proofHash: proofHash,
            timestamp: block.timestamp
        }));
    }

    // Get all donations by a donor's blockchain ID
    function getDonationsByDonorId(bytes15 donorId) public view returns (Donation[] memory) {
        uint256 count;
        for (uint i = 0; i < donations.length; i++) {
            if (donations[i].donorId == donorId) {
                count++;
            }
        }

        Donation[] memory result = new Donation[](count);
        uint256 j;
        for (uint i = 0; i < donations.length; i++) {
            if (donations[i].donorId == donorId) {
                result[j] = donations[i];
                j++;
            }
        }
        return result;
    }

    // Get all donations by a donor's username
    function getDonationsByDonorUsername(string memory donorUsername) public view returns (Donation[] memory) {
        uint256 count;
        for (uint i = 0; i < donations.length; i++) {
            if (keccak256(abi.encodePacked(donations[i].donorUserName)) == keccak256(abi.encodePacked(donorUsername))) {
                count++;
            }
        }

        Donation[] memory result = new Donation[](count);
        uint256 j;
        for (uint i = 0; i < donations.length; i++) {
            if (keccak256(abi.encodePacked(donations[i].donorUserName)) == keccak256(abi.encodePacked(donorUsername))) {
                result[j] = donations[i];
                j++;
            }
        }
        return result;
    }
}