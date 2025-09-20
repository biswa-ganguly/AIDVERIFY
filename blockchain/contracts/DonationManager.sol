// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

contract DonationManager {
    struct Donation {
        bytes32 donation_id;
        uint256 campaignId;
        bytes32 donor_id;
        uint256 amount;
        string proofHash; // IPFS hash of screenshot/receipt
        uint256 timestamp;
    }

    // mapping of donationId → Donation details
    mapping (bytes32 => Donation) internal donations;

    // to make retrieval easier
    mapping (bytes32 => bytes32[]) internal donorToDonations;    // donorId → donationIds
    mapping (uint256 => bytes32[]) internal campaignToDonations; // campaignId → donationIds

    // event
    event DonationMade(bytes32 donationId, uint256 campaignId, bytes32 donorId, uint256 amount, string proofHash);

    // unique id generator
    function uniqueDonationIdGenearator() private view returns(bytes32) {
        return keccak256(
            abi.encodePacked(msg.sender, block.timestamp, block.prevrandao, blockhash(block.number-1))
        );
    }

    // donate function
    function donate(uint256 campaignId, bytes32 donorID, uint256 amount, string memory proofHash) public {
        bytes32 newDonationId = uniqueDonationIdGenearator();

        donations[newDonationId] = Donation({
            donation_id: newDonationId,
            campaignId: campaignId,
            donor_id: donorID,
            amount: amount,
            proofHash: proofHash,
            timestamp: block.timestamp
        });

        // map donation id
        donorToDonations[donorID].push(newDonationId);
        campaignToDonations[campaignId].push(newDonationId);

        emit DonationMade(newDonationId, campaignId, donorID, amount, proofHash);
    }

    // fetch all donations by donorID
    function getDonationsByDonorID(bytes32 donorID) public view returns (Donation[] memory) {
        bytes32[] memory donationIds = donorToDonations[donorID];
        Donation[] memory result = new Donation[](donationIds.length);

        for (uint i = 0; i < donationIds.length; i++) {
            result[i] = donations[donationIds[i]];
        }

        return result;
    }

    // fetch all donations by campaignId
    function getDonationsByCampaign(uint256 campaignId) public view returns (Donation[] memory) {
        bytes32[] memory donationIds = campaignToDonations[campaignId];
        Donation[] memory result = new Donation[](donationIds.length);

        for (uint i = 0; i < donationIds.length; i++) {
            result[i] = donations[donationIds[i]];
        }

        return result;
    }
}
