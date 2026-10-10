CREATE TABLE karyawan (
    id_karyawan VARCHAR(20) PRIMARY KEY,
    nama_karyawan VARCHAR(100) NOT NULL,
    posisi VARCHAR(50) NOT NULL
);

INSERT INTO karyawan (id_karyawan, nama_karyawan, posisi) VALUES
('051348541', 'FARAH FADILLA', 'Business Analyst'),
('050276882', 'LUCKY CANDRA PRASETYO', 'HRD'),
('047969031', 'PUTRI KINTAN SEPTIANI', 'Software Engineer'),
('049895431', 'RIO HARYANTO', 'Quality Assurance'),
('051095401', 'SUHENDI', 'Project Admin'),
('052184736', 'ANDI PRATAMA', 'UI/UX Designer'),
('053276491', 'NADIA PUTRI LESTARI', 'Data Analyst'),
('048365217', 'FAJAR RAMADHAN', 'System Administrator'),
('052917364', 'SITI AMELIA', 'Product Manager'),
('050638271', 'DIMAS ARYANTO', 'IT Support');
