-- =====================================================
-- POPULATE_DATA_FULL.SQL
-- AI Attendance Tracker — Full Populate Script
-- WARNING: This script TRUNCATES tables and RESTARTs identities.
-- =====================================================

TRUNCATE TABLE attendance_logs, attendance, student_course, courses, students, lecturers, faculties RESTART IDENTITY CASCADE;

-- =====================================================
-- 1) FACULTIES
-- =====================================================
INSERT INTO faculties (faculty_name, description) VALUES
('Faculty of Computing and Informatics', 'Computing, data science, software engineering.'),
('Faculty of Engineering and Technology', 'Civil, electrical, mechanical and allied engineering.'),
('Faculty of Business and Economics', 'Business, finance, accounting and management.'),
('Faculty of Medicine and Health Sciences', 'Medicine, nursing, public health.'),
('Faculty of Law and Governance', 'Law, governance, human rights.'),
('Faculty of Education and Human Sciences', 'Teacher training, psychology, sociology.'),
('Faculty of Arts and Social Sciences', 'Literature, history, languages.'),
('Faculty of Agriculture and Environment', 'Agriculture, agribusiness, environmental studies');

-- =====================================================
-- 2) LECTURERS (30)
-- Columns: lecturer_name, email, department, faculty_id, password_hash
-- =====================================================
INSERT INTO lecturers (lecturer_name, email, department, faculty_id, password_hash) VALUES
('Dr. Brian Mwangi', 'brian.mwangi@university.ac.ke', 'Computer Science', 1, 'pass123'),
('Dr. Wanjiru Kimani', 'wanjiru.kimani@university.ac.ke', 'Software Engineering', 1, 'pass123'),
('Dr. Paul Muriithi', 'paul.muriithi@university.ac.ke', 'AI Systems', 1, 'pass123'),
('Dr. Lydia Wairimu', 'lydia.wairimu@university.ac.ke', 'Data Science', 1, 'pass123'),
('Dr. Kelvin Mworia', 'kelvin.mworia@university.ac.ke', 'Computer Networks', 1, 'pass123'),
('Prof. Peter Ochieng', 'peter.ochieng@university.ac.ke', 'Electrical Engineering', 2, 'pass123'),
('Dr. Mercy Njoroge', 'mercy.njoroge@university.ac.ke', 'Civil Engineering', 2, 'pass123'),
('Dr. Kevin Kiptoo', 'kevin.kiptoo@university.ac.ke', 'Mechanical Engineering', 2, 'pass123'),
('Prof. Francis Koech', 'francis.koech@university.ac.ke', 'Mechanical Engineering', 2, 'pass123'),
('Dr. Dennis Githinji', 'dennis.githinji@university.ac.ke', 'Electrical Engineering', 2, 'pass123'),
('Dr. Sheila Mutua', 'sheila.mutua@university.ac.ke', 'Business Administration', 3, 'pass123'),
('Dr. Samuel Otieno', 'samuel.otieno@university.ac.ke', 'Finance', 3, 'pass123'),
('Dr. Cynthia Naliaka', 'cynthia.naliaka@university.ac.ke', 'Business Analytics', 3, 'pass123'),
('Dr. Henry Wekesa', 'henry.wekesa@university.ac.ke', 'Corporate Finance', 3, 'pass123'),
('Dr. Ahmed Noor', 'ahmed.noor@university.ac.ke', 'Clinical Medicine', 4, 'pass123'),
('Dr. Grace Wambui', 'grace.wambui@university.ac.ke', 'Nursing', 4, 'pass123'),
('Dr. Thomas Kibet', 'thomas.kibet@university.ac.ke', 'Pathology', 4, 'pass123'),
('Dr. Victor Musyoka', 'victor.musyoka@university.ac.ke', 'Constitutional Law', 5, 'pass123'),
('Dr. Janet Kendi', 'janet.kendi@university.ac.ke', 'Literature', 7, 'pass123'),
('Dr. Lucy Anyango', 'lucy.anyango@university.ac.ke', 'Sociology', 7, 'pass123'),
('Dr. Elias Kiplangat', 'elias.kiplangat@university.ac.ke', 'Agriculture', 8, 'pass123'),
('Dr. Beatrice Naliaka', 'beatrice.naliaka@university.ac.ke', 'AgriTech', 8, 'pass123'),
('Dr. John Kamau', 'john.kamau@university.ac.ke', 'Curriculum Studies', 6, 'pass123'),
('Dr. Carolyne Achieng', 'carolyne.achieng@university.ac.ke', 'Education', 6, 'pass123'),
('Dr. Ruth Muthoni', 'ruth.muthoni@university.ac.ke', 'Information Systems', 1, 'pass123'),
('Dr. Eric Oduor', 'eric.oduor@university.ac.ke', 'Software Engineering', 1, 'pass123'),
('Dr. Naomi Wanja', 'naomi.wanja@university.ac.ke', 'Education Technology', 6, 'pass123'),
('Dr. Jackline Atieno', 'jackline.atieno@university.ac.ke', 'Arts', 7, 'pass123'),
('Dr. Anthony Mwangi', 'anthony.mwangi@university.ac.ke', 'Agribusiness', 8, 'pass123'),
('Dr. Beatrice Cheruiyot', 'beatrice.cheruiyot@university.ac.ke', 'Human Rights Law', 5, 'pass123');

-- =====================================================
-- 3) STUDENTS (100 entries)
-- Columns: student_name, reg_number, email, year_of_study, faculty_id, image_path, password_hash
-- =====================================================
INSERT INTO students (student_name, reg_number, email, year_of_study, faculty_id, image_path, password_hash) VALUES
('Alek Deng', 'CS2025/001', 'alek.deng@students.ac.ke', 3, 1, '/images/students/alek_deng.jpg', 'pass123'),
('Mary Wanjiku', 'CS2025/002', 'mary.wanjiku@students.ac.ke', 3, 1, '/images/students/mary_wanjiku.jpg', 'pass123'),
('Brian Barasa', 'ENG2025/003', 'brian.barasa@students.ac.ke', 2, 2, '/images/students/brian_barasa.jpg', 'pass123'),
('Faith Cherop', 'BUS2025/004', 'faith.cherop@students.ac.ke', 1, 3, '/images/students/faith_cherop.jpg', 'pass123'),
('Peter Otieno', 'LAW2025/005', 'peter.otieno@students.ac.ke', 4, 5, '/images/students/peter_otieno.jpg', 'pass123'),
('Janet Naliaka', 'AGR2025/006', 'janet.naliaka@students.ac.ke', 2, 8, '/images/students/janet_naliaka.jpg', 'pass123'),
('Tom Kiptoo', 'EDU2025/007', 'tom.kiptoo@students.ac.ke', 1, 6, '/images/students/tom_kiptoo.jpg', 'pass123'),
('Cynthia Mutua', 'ART2025/008', 'cynthia.mutua@students.ac.ke', 3, 7, '/images/students/cynthia_mutua.jpg', 'pass123'),
('Kevin Muriuki', 'CS2025/009', 'kevin.muriuki@students.ac.ke', 2, 1, '/images/students/kevin_muriuki.jpg', 'pass123'),
('Lydia Chebet', 'MED2025/010', 'lydia.chebet@students.ac.ke', 3, 4, '/images/students/lydia_chebet.jpg', 'pass123'),
('George Kamau', 'CS2025/011', 'george.kamau@students.ac.ke', 1, 1, '/images/students/george_kamau.jpg', 'pass123'),
('Naomi Njeri', 'BUS2025/012', 'naomi.njeri@students.ac.ke', 2, 3, '/images/students/naomi_njeri.jpg', 'pass123'),
('Samuel Omondi', 'ENG2025/013', 'samuel.omondi@students.ac.ke', 1, 2, '/images/students/samuel_omondi.jpg', 'pass123'),
('Evelyn Awuor', 'EDU2025/014', 'evelyn.awuor@students.ac.ke', 4, 6, '/images/students/evelyn_awuor.jpg', 'pass123'),
('Joseph Okoth', 'LAW2025/015', 'joseph.okoth@students.ac.ke', 2, 5, '/images/students/joseph_okoth.jpg', 'pass123'),
('Rose Ndegwa', 'ART2025/016', 'rose.ndegwa@students.ac.ke', 3, 7, '/images/students/rose_ndegwa.jpg', 'pass123'),
('Daniel Kiplagat', 'CS2025/017', 'daniel.kiplagat@students.ac.ke', 2, 1, '/images/students/daniel_kiplagat.jpg', 'pass123'),
('Ruth Wambui', 'MED2025/018', 'ruth.wambui@students.ac.ke', 4, 4, '/images/students/ruth_wambui.jpg', 'pass123'),
('Nicholas Kiprono', 'ENG2025/019', 'nicholas.kiprono@students.ac.ke', 3, 2, '/images/students/nicholas_kiprono.jpg', 'pass123'),
('Beatrice Mutheu', 'BUS2025/020', 'beatrice.mutheu@students.ac.ke', 1, 3, '/images/students/beatrice_mutheu.jpg', 'pass123'),
('Michael Ouma', 'CS2025/021', 'michael.ouma@students.ac.ke', 3, 1, '/images/students/michael_ouma.jpg', 'pass123'),
('Dorcas Chebet', 'EDU2025/022', 'dorcas.chebet@students.ac.ke', 2, 6, '/images/students/dorcas_chebet.jpg', 'pass123'),
('Victor Onyango', 'AGR2025/023', 'victor.onyango@students.ac.ke', 2, 8, '/images/students/victor_onyango.jpg', 'pass123'),
('Jane Wanjiru', 'LAW2025/024', 'jane.wanjiru@students.ac.ke', 1, 5, '/images/students/jane_wanjiru.jpg', 'pass123'),
('Collins Oduor', 'BUS2025/025', 'collins.oduor@students.ac.ke', 4, 3, '/images/students/collins_oduor.jpg', 'pass123'),
('Ruth Achieng', 'ART2025/026', 'ruth.achieng@students.ac.ke', 3, 7, '/images/students/ruth_achieng.jpg', 'pass123'),
('Emmanuel Mwangi', 'CS2025/027', 'emmanuel.mwangi@students.ac.ke', 2, 1, '/images/students/emmanuel_mwangi.jpg', 'pass123'),
('Naomi Cheruiyot', 'MED2025/028', 'naomi.cheruiyot@students.ac.ke', 5, 4, '/images/students/naomi_cheruiyot.jpg', 'pass123'),
('Nicholas Onsomu', 'ENG2025/029', 'nicholas.onsomu@students.ac.ke', 3, 2, '/images/students/nicholas_onsomu.jpg', 'pass123'),
('Beatrice Wairimu', 'BUS2025/030', 'beatrice.wairimu@students.ac.ke', 2, 3, '/images/students/beatrice_wairimu.jpg', 'pass123'),
('Michael Kipkoech', 'CS2025/031', 'michael.kipkoech@students.ac.ke', 1, 1, '/images/students/michael_kipkoech.jpg', 'pass123'),
('Dorothy Ndegwa', 'EDU2025/032', 'dorothy.ndegwa@students.ac.ke', 4, 6, '/images/students/dorothy_ndegwa.jpg', 'pass123'),
('Fredrick Ouma', 'AGR2025/033', 'fredrick.ouma@students.ac.ke', 3, 8, '/images/students/fredrick_ouma.jpg', 'pass123'),
('Sylvia Kendi', 'LAW2025/034', 'sylvia.kendi@students.ac.ke', 2, 5, '/images/students/sylvia_kendi.jpg', 'pass123'),
('Kevin Komen', 'CS2025/035', 'kevin.komen@students.ac.ke', 2, 1, '/images/students/kevin_komen.jpg', 'pass123'),
('Irene Anyango', 'BUS2025/036', 'irene.anyango@students.ac.ke', 3, 3, '/images/students/irene_anyango.jpg', 'pass123'),
('Tom Oloo', 'ENG2025/037', 'tom.oloo@students.ac.ke', 1, 2, '/images/students/tom_oloo.jpg', 'pass123'),
('Rebecca Serem', 'ART2025/038', 'rebecca.serem@students.ac.ke', 3, 7, '/images/students/rebecca_serem.jpg', 'pass123'),
('Daniel Cheruiyot', 'CS2025/039', 'daniel.cheruiyot@students.ac.ke', 4, 1, '/images/students/daniel_cheruiyot.jpg', 'pass123'),
('Esther Wanja', 'MED2025/040', 'esther.wanja@students.ac.ke', 3, 4, '/images/students/esther_wanja.jpg', 'pass123'),
('Brian Kipyegon', 'ENG2025/041', 'brian.kipyegon@students.ac.ke', 2, 2, '/images/students/brian_kipyegon.jpg', 'pass123'),
('Alice Njeri', 'BUS2025/042', 'alice.njeri@students.ac.ke', 1, 3, '/images/students/alice_njeri.jpg', 'pass123'),
('Paul Kiptoo', 'CS2025/043', 'paul.kiptoo@students.ac.ke', 3, 1, '/images/students/paul_kiptoo.jpg', 'pass123'),
('Mercy Nduta', 'EDU2025/044', 'mercy.nduta@students.ac.ke', 2, 6, '/images/students/mercy_nduta.jpg', 'pass123'),
('Josephine Awuor', 'ART2025/045', 'josephine.awuor@students.ac.ke', 4, 7, '/images/students/josephine_awuor.jpg', 'pass123'),
('Felix Omondi', 'AGR2025/046', 'felix.omondi@students.ac.ke', 3, 8, '/images/students/felix_omondi.jpg', 'pass123'),
('Winnie Muthoni', 'LAW2025/047', 'winnie.muthoni@students.ac.ke', 2, 5, '/images/students/winnie_muthoni.jpg', 'pass123'),
('Kennedy Rotich', 'CS2025/048', 'kennedy.rotich@students.ac.ke', 2, 1, '/images/students/kennedy_rotich.jpg', 'pass123'),
('Susan Akinyi', 'MED2025/049', 'susan.akinyi@students.ac.ke', 4, 4, '/images/students/susan_akinyi.jpg', 'pass123'),
('Peter Kiplagat', 'ENG2025/050', 'peter.kiplagat@students.ac.ke', 3, 2, '/images/students/peter_kiplagat.jpg', 'pass123'),
('Angela Wambui', 'BUS2025/051', 'angela.wambui@students.ac.ke', 1, 3, '/images/students/angela_wambui.jpg', 'pass123'),
('Stephen Ouma', 'CS2025/052', 'stephen.ouma@students.ac.ke', 4, 1, '/images/students/stephen_ouma.jpg', 'pass123'),
('Florence Chebet', 'EDU2025/053', 'florence.chebet@students.ac.ke', 3, 6, '/images/students/florence_chebet.jpg', 'pass123'),
('Barnabas Kiptanui', 'AGR2025/054', 'barnabas.kiptanui@students.ac.ke', 2, 8, '/images/students/barnabas_kiptanui.jpg', 'pass123'),
('Zoe Mutiso', 'ART2025/055', 'zoe.mutiso@students.ac.ke', 2, 7, '/images/students/zoe_mutiso.jpg', 'pass123'),
('Tony Oloo', 'CS2025/056', 'tony.oloo@students.ac.ke', 1, 1, '/images/students/tony_oloo.jpg', 'pass123'),
('Martha Wairimu', 'MED2025/057', 'martha.wairimu@students.ac.ke', 3, 4, '/images/students/martha_wairimu.jpg', 'pass123'),
('Dennis Kipkorir', 'ENG2025/058', 'dennis.kipkorir@students.ac.ke', 2, 2, '/images/students/dennis_kipkorir.jpg', 'pass123'),
('Irene Kipsang', 'BUS2025/059', 'irene.kipsang@students.ac.ke', 4, 3, '/images/students/irene_kipsang.jpg', 'pass123'),
('Joshua Njoroge', 'CS2025/060', 'joshua.njoroge@students.ac.ke', 3, 1, '/images/students/joshua_njoroge.jpg', 'pass123'),
('Eunice Chebet', 'EDU2025/061', 'eunice.chebet@students.ac.ke', 2, 6, '/images/students/eunice_chebet.jpg', 'pass123'),
('Lucas Karanja', 'AGR2025/062', 'lucas.karanja@students.ac.ke', 3, 8, '/images/students/lucas_karanja.jpg', 'pass123'),
('Naomi Wairimu', 'LAW2025/063', 'naomi.wairimu@students.ac.ke', 3, 5, '/images/students/naomi_wairimu.jpg', 'pass123'),
('Caleb Cheruyiot', 'CS2025/064', 'caleb.cheruyiot@students.ac.ke', 2, 1, '/images/students/caleb_cheruyiot.jpg', 'pass123'),
('Winnie Nyawira', 'BUS2025/065', 'winnie.nyawira@students.ac.ke', 1, 3, '/images/students/winnie_nyawira.jpg', 'pass123'),
('Eric Ombok', 'CS2025/066', 'eric.ombok@students.ac.ke', 4, 1, '/images/students/eric_ombok.jpg', 'pass123'),
('Priscilla Adera', 'MED2025/067', 'priscilla.adera@students.ac.ke', 4, 4, '/images/students/priscilla_adera.jpg', 'pass123'),
('Hillary Kiprop', 'ENG2025/068', 'hillary.kiprop@students.ac.ke', 2, 2, '/images/students/hillary_kiprop.jpg', 'pass123'),
('Miriam Nyambura', 'ART2025/069', 'miriam.nyambura@students.ac.ke', 3, 7, '/images/students/miriam_nyambura.jpg', 'pass123'),
('Fredrick Kiptoo', 'AGR2025/070', 'fredrick.kiptoo@students.ac.ke', 1, 8, '/images/students/fredrick_kiptoo.jpg', 'pass123'),
('Patricia Wangui', 'CS2025/071', 'patricia.wangui@students.ac.ke', 2, 1, '/images/students/patricia_wangui.jpg', 'pass123'),
('Nelson Ouko', 'BUS2025/072', 'nelson.ouko@students.ac.ke', 3, 3, '/images/students/nelson_ouko.jpg', 'pass123'),
('Grace Nyokabi', 'EDU2025/073', 'grace.nyokabi@students.ac.ke', 1, 6, '/images/students/grace_nyokabi.jpg', 'pass123'),
('Timothy Ndegwa', 'ENG2025/074', 'timothy.ndegwa@students.ac.ke', 3, 2, '/images/students/timothy_ndegwa.jpg', 'pass123'),
('Patience Chepkemoi', 'MED2025/075', 'patience.chepkemoi@students.ac.ke', 4, 4, '/images/students/patience_chepkemoi.jpg', 'pass123'),
('Martin Kipruto', 'AGR2025/076', 'martin.kipruto@students.ac.ke', 2, 8, '/images/students/martin_kipruto.jpg', 'pass123'),
('Esther Njoki', 'LAW2025/077', 'esther.njoki@students.ac.ke', 2, 5, '/images/students/esther_njoki.jpg', 'pass123'),
('Abel Kibet', 'CS2025/078', 'abel.kibet@students.ac.ke', 3, 1, '/images/students/abel_kibet.jpg', 'pass123'),
('Lilian Aoko', 'BUS2025/079', 'lilian.aoko@students.ac.ke', 2, 3, '/images/students/lilian_aoko.jpg', 'pass123'),
('Bernard Korir', 'ENG2025/080', 'bernard.korir@students.ac.ke', 4, 2, '/images/students/bernard_korir.jpg', 'pass123'),
('Joyce Muli', 'ART2025/081', 'joyce.muli@students.ac.ke', 3, 7, '/images/students/joyce_muli.jpg', 'pass123'),
('Omondi Achieng', 'CS2025/082', 'omondi.achieng@students.ac.ke', 1, 1, '/images/students/omondi_achieng.jpg', 'pass123'),
('Catherine Wanjiru', 'MED2025/083', 'catherine.wanjiru@students.ac.ke', 4, 4, '/images/students/catherine_wanjiru.jpg', 'pass123'),
('Daniel Kiptoo', 'ENG2025/084', 'daniel.kiptoo@students.ac.ke', 2, 2, '/images/students/daniel_kiptoo.jpg', 'pass123'),
('Martha Njeri', 'EDU2025/085', 'martha.njeri@students.ac.ke', 1, 6, '/images/students/martha_njeri.jpg', 'pass123'),
('Kenneth Mutua', 'BUS2025/086', 'kenneth.mutua@students.ac.ke', 3, 3, '/images/students/kenneth_mutua.jpg', 'pass123'),
('Angela Kiptum', 'AGR2025/087', 'angela.kiptum@students.ac.ke', 2, 8, '/images/students/angela_kiptum.jpg', 'pass123'),
('Edwin Nyaga', 'CS2025/088', 'edwin.nyaga@students.ac.ke', 2, 1, '/images/students/edwin_nyaga.jpg', 'pass123'),
('Monica Atieno', 'LAW2025/089', 'monica.atieno@students.ac.ke', 3, 5, '/images/students/monica_atieno.jpg', 'pass123'),
('Victor Okeyo', 'ENG2025/090', 'victor.okeyo@students.ac.ke', 4, 2, '/images/students/victor_okeyo.jpg', 'pass123'),
('Patricia Njoki', 'EDU2025/091', 'patricia.njoki@students.ac.ke', 2, 6, '/images/students/patricia_njoki.jpg', 'pass123'),
('Isaac Kiptanui', 'AGR2025/092', 'isaac.kiptanui@students.ac.ke', 1, 8, '/images/students/isaac_kiptanui.jpg', 'pass123'),
('Moses Kibet', 'CS2025/093', 'moses.kibet@students.ac.ke', 3, 1, '/images/students/moses_kibet.jpg', 'pass123'),
('Wanjiru Nyambura', 'BUS2025/094', 'wanjiru.nyambura@students.ac.ke', 4, 3, '/images/students/wanjiru_nyambura.jpg', 'pass123'),
('Ezekiel Anyango', 'MED2025/095', 'ezekiel.anyango@students.ac.ke', 2, 4, '/images/students/ezekiel_anyango.jpg', 'pass123'),
('Caroline Njoki', 'ART2025/096', 'caroline.njoki@students.ac.ke', 3, 7, '/images/students/caroline_njoki.jpg', 'pass123'),
('Philip Keter', 'ENG2025/097', 'philip.keter@students.ac.ke', 2, 2, '/images/students/philip_keter.jpg', 'pass123'),
('Annette Chepngeno', 'CS2025/098', 'annette.chepngeno@students.ac.ke', 1, 1, '/images/students/annette_chepngeno.jpg', 'pass123'),
('Gideon Rutto', 'LAW2025/099', 'gideon.rutto@students.ac.ke', 3, 5, '/images/students/gideon_rutto.jpg', 'pass123'),
('Helena Wangari', 'BUS2025/100', 'helena.wangari@students.ac.ke', 2, 3, '/images/students/helena_wangari.jpg', 'pass123');

-- =====================================================
-- 4) COURSES (100 entries distributed across faculties)
-- Columns: course_name, course_code, faculty_id, lecturer_id
-- =====================================================
INSERT INTO courses (course_name, course_code, faculty_id, lecturer_id) VALUES
-- Computing & Informatics (faculty_id = 1)
('Introduction to Programming', 'CSC1101', 1, 1),
('Data Structures', 'CSC1102', 1, 1),
('Algorithms', 'CSC1201', 1, 2),
('Database Systems', 'CSC2202', 1, 21),
('Operating Systems', 'CSC2103', 1, 19),
('Software Engineering', 'CSC3101', 1, 2),
('Web Development', 'CSC2204', 1, 2),
('Machine Learning', 'CSC3203', 1, 3),
('Artificial Intelligence', 'CSC4102', 1, 3),
('Computer Networks', 'CSC3304', 1, 20),
('Cyber Security Fundamentals', 'CSC2301', 1, 18),
('Data Science Practicum', 'CSC3501', 1, 18),
-- Engineering (faculty_id = 2)
('Engineering Mathematics', 'ENG1101', 2, 6),
('Circuit Theory', 'ENG2102', 2, 6),
('Thermodynamics', 'ENG3104', 2, 9),
('Fluid Mechanics', 'ENG2203', 2, 9),
('Structural Analysis', 'ENG3201', 2, 4),
('Materials Science', 'ENG2105', 2, 4),
('Digital Systems', 'ENG2206', 2, 10),
('Control Systems', 'ENG2302', 2, 10),
('Power Systems', 'ENG3303', 2, 23),
('Mechanical Design', 'ENG3105', 2, 5),
('Electronics Lab', 'ENG1202', 2, 6),
('Environmental Engineering', 'ENG3401', 2, 4),
-- Business & Economics (faculty_id = 3)
('Principles of Accounting', 'BUS1101', 3, 11),
('Business Law', 'BUS2101', 3, 11),
('Microeconomics', 'BUS1102', 3, 12),
('Macroeconomics', 'BUS1202', 3, 12),
('Corporate Finance', 'BUS3204', 3, 13),
('Marketing Principles', 'BUS2203', 3, 13),
('Business Analytics', 'BUS3103', 3, 24),
('Entrepreneurship', 'BUS2104', 3, 24),
('Organizational Behavior', 'BUS2301', 3, 6),
('Human Resource Management', 'BUS2305', 3, 13),
('Financial Accounting', 'BUS2102', 3, 12),
('Supply Chain Management', 'BUS3301', 3, 24),
-- Medicine & Health Sciences (faculty_id = 4)
('Human Anatomy', 'MED1101', 4, 15),
('Physiology', 'MED1202', 4, 15),
('Microbiology', 'MED1301', 4, 17),
('Pathology', 'MED2103', 4, 17),
('Nursing Fundamentals', 'MED2201', 4, 16),
('Public Health', 'MED2301', 4, 16),
('Pharmacology', 'MED3102', 4, 27),
('Clinical Skills', 'MED3204', 4, 27),
('Epidemiology', 'MED3301', 4, 15),
('Biomedical Research Methods', 'MED3402', 4, 17),
('Medical Ethics', 'MED3501', 4, 17),
('Nursing Practice', 'MED3601', 4, 16),
-- Law & Governance (faculty_id = 5)
('Constitutional Law', 'LAW1101', 5, 19),
('Criminal Law', 'LAW2102', 5, 19),
('Law of Torts', 'LAW2101', 5, 19),
('International Human Rights', 'LAW3101', 5, 29),
('Corporate Law', 'LAW3202', 5, 29),
('Legal Research Methods', 'LAW3301', 5, 19),
('Property Law', 'LAW3401', 5, 19),
('Administrative Law', 'LAW3501', 5, 29),
('Environmental Law', 'LAW3601', 5, 29),
('Comparative Law', 'LAW3701', 5, 19),
-- Education & Human Sciences (faculty_id = 6)
('Educational Psychology', 'EDU2101', 6, 23),
('Curriculum Design', 'EDU2202', 6, 23),
('Instructional Technology', 'EDU3103', 6, 26),
('Assessment and Evaluation', 'EDU3201', 6, 23),
('Special Needs Education', 'EDU3302', 6, 23),
('Teacher Professionalism', 'EDU3401', 6, 23),
('Sociology of Education', 'EDU3501', 6, 24),
('Guidance and Counseling', 'EDU3601', 6, 24),
('Research Methods in Education', 'EDU3701', 6, 23),
('School Management', 'EDU3801', 6, 23),
-- Arts & Social Sciences (faculty_id = 7)
('African Literature', 'ART2101', 7, 14),
('Philosophy and Ethics', 'ART2202', 7, 14),
('Sociology of Development', 'ART3103', 7, 15),
('Cultural Studies', 'ART3201', 7, 15),
('History of East Africa', 'ART3301', 7, 15),
('Linguistics', 'ART3401', 7, 15),
('Media Studies', 'ART3501', 7, 14),
('Creative Writing', 'ART3601', 7, 14),
('Performing Arts', 'ART3701', 7, 14),
('Phonetics and Phonology', 'ART3801', 7, 15),
-- Agriculture & Environment (faculty_id = 8)
('Crop Science', 'AGR2101', 8, 21),
('Soil Science', 'AGR2201', 8, 21),
('Agribusiness Management', 'AGR2301', 8, 22),
('Sustainable Agriculture', 'AGR2401', 8, 22),
('Animal Husbandry', 'AGR2501', 8, 21),
('AgriTech Innovations', 'AGR2601', 8, 22),
('Environmental Management', 'AGR2701', 8, 22),
('Irrigation Systems', 'AGR2801', 8, 21),
('Postharvest Technology', 'AGR2901', 8, 22),
('Soil Fertility and Nutrition', 'AGR3001', 8, 21);

-- =====================================================
-- 5) STUDENT-COURSE ENROLLMENTS
-- Each student will be enrolled in ~3-5 courses (randomized)
-- We'll insert many rows using a SELECT that picks random courses per student
-- =====================================================
INSERT INTO student_course (student_id, course_id, semester, year)
SELECT s.student_id, c.course_id,
       CASE WHEN RANDOM() < 0.5 THEN 'Semester 1' ELSE 'Semester 2' END,
       2025
FROM students s
CROSS JOIN LATERAL (
    SELECT course_id FROM courses ORDER BY RANDOM() LIMIT (3 + (RANDOM()*2)::int)
) c;

-- =====================================================
-- End of populate_data_full.sql
-- =====================================================

