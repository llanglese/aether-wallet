// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Guestbook
 * @notice Minimal on-chain guestbook for DApp write/read demos.
 */
contract Guestbook {
    event MessagePosted(address indexed author, string content, uint256 timestamp);

    string public latestMessage;
    address public latestAuthor;
    uint256 public messageCount;

    function postMessage(string calldata content) external {
        require(bytes(content).length > 0, "empty message");
        require(bytes(content).length <= 280, "too long");
        latestMessage = content;
        latestAuthor = msg.sender;
        unchecked {
            messageCount += 1;
        }
        emit MessagePosted(msg.sender, content, block.timestamp);
    }
}
