-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Oct 01, 2025 at 11:46 AM
-- Server version: 8.0.43
-- PHP Version: 8.2.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `Raamatukogu`
--

-- --------------------------------------------------------

--
-- Table structure for table `Author`
--

CREATE TABLE `Author` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `bio` text NOT NULL,
  `created_at` timestamp NOT NULL COMMENT 'When was author added to database'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Book`
--

CREATE TABLE `Book` (
  `id` int UNSIGNED NOT NULL COMMENT 'Book ID',
  `bookname` varchar(255) NOT NULL COMMENT 'Title of the book',
  `author_id` int UNSIGNED NOT NULL COMMENT 'Author of the book',
  `book_description` text NOT NULL,
  `published_date` date NOT NULL,
  `added_time` timestamp NOT NULL COMMENT 'Timestamp when book was added to database'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Loan`
--

CREATE TABLE `Loan` (
  `id` int UNSIGNED NOT NULL,
  `book_id` int UNSIGNED NOT NULL,
  `member_id` int UNSIGNED NOT NULL,
  `loaned_date` datetime NOT NULL,
  `due_date` date NOT NULL,
  `returned_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Member`
--

CREATE TABLE `Member` (
  `id` int UNSIGNED NOT NULL COMMENT 'Member ID',
  `name` varchar(255) NOT NULL COMMENT 'Members name',
  `email` varchar(255) NOT NULL COMMENT 'Members email',
  `registered_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when user registered'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Author`
--
ALTER TABLE `Author`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Book`
--
ALTER TABLE `Book`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Book_ibfk_1` (`author_id`);

--
-- Indexes for table `Loan`
--
ALTER TABLE `Loan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Loan_ibfk_1` (`book_id`),
  ADD KEY `member_id` (`member_id`);

--
-- Indexes for table `Member`
--
ALTER TABLE `Member`
  ADD UNIQUE KEY `id` (`id`) USING BTREE;

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Author`
--
ALTER TABLE `Author`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Book`
--
ALTER TABLE `Book`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Book ID';

--
-- AUTO_INCREMENT for table `Loan`
--
ALTER TABLE `Loan`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Member`
--
ALTER TABLE `Member`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Member ID';

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Book`
--
ALTER TABLE `Book`
  ADD CONSTRAINT `Book_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `Author` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `Loan`
--
ALTER TABLE `Loan`
  ADD CONSTRAINT `Loan_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `Book` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `Loan_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `Member` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;