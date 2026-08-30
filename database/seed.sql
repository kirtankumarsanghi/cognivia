-- This script should be run AFTER auth users are created via Supabase Auth UI / API.
-- For demo purposes, we will assume we create standard demo users and mock their UUIDs,
-- but since auth.users is managed by Supabase, we can't easily seed it directly with raw SQL.
-- INSTEAD, we will use mock UUIDs here just for the relational data, and the backend will have a "Demo Mode" fallback,
-- or we can assume the developer will create the users in Supabase Auth and map their IDs.
-- Let's use fixed UUIDs for the demo data.

DO $$
DECLARE
  educator_id UUID := '00000000-0000-0000-0000-000000000001';
  student_id UUID := '00000000-0000-0000-0000-000000000002';
  course_id UUID := '11111111-1111-1111-1111-111111111111';
  lesson1_id UUID := '22222222-2222-2222-2222-222222222221';
  
  c_arrays UUID := '33333333-3333-3333-3333-333333333331';
  c_searching UUID := '33333333-3333-3333-3333-333333333332';
  c_logarithms UUID := '33333333-3333-3333-3333-333333333333';
  c_bigo UUID := '33333333-3333-3333-3333-333333333334';
  c_binary_search UUID := '33333333-3333-3333-3333-333333333335';
  c_recursion UUID := '33333333-3333-3333-3333-333333333336';
  c_sorting UUID := '33333333-3333-3333-3333-333333333337';
BEGIN

  -- 1. Profiles (We will insert directly into public.profiles for demo purposes, 
  -- but note these won't be able to login unless also in auth.users)
  INSERT INTO public.profiles (id, name, email, role)
  VALUES 
    (educator_id, 'Prof. Alan Turing', 'educator@cogniva.edu', 'educator'),
    (student_id, 'Ada Lovelace', 'student@cogniva.edu', 'student')
  ON CONFLICT (id) DO NOTHING;

  -- 2. Course
  INSERT INTO public.courses (id, name, code, description, educator_id)
  VALUES (course_id, 'Data Structures & Algorithms', 'CS101', 'Core computer science concepts.', educator_id)
  ON CONFLICT (id) DO NOTHING;

  -- 3. Lesson
  INSERT INTO public.lessons (id, course_id, title, description, order_number)
  VALUES (lesson1_id, course_id, 'Searching and Complexity', 'Introduction to searching algorithms and Big-O.', 1)
  ON CONFLICT (id) DO NOTHING;

  -- 4. Concepts
  INSERT INTO public.concepts (id, lesson_id, name, description, difficulty)
  VALUES 
    (c_arrays, lesson1_id, 'Arrays', 'Contiguous memory allocation.', 'beginner'),
    (c_searching, lesson1_id, 'Searching', 'Finding items in a collection.', 'beginner'),
    (c_logarithms, lesson1_id, 'Logarithms', 'The inverse operation to exponentiation.', 'intermediate'),
    (c_bigo, lesson1_id, 'Big-O Complexity', 'Asymptotic notation for algorithm performance.', 'intermediate'),
    (c_binary_search, lesson1_id, 'Binary Search', 'O(log n) search on sorted arrays.', 'advanced'),
    (c_recursion, lesson1_id, 'Recursion', 'Functions calling themselves.', 'intermediate'),
    (c_sorting, lesson1_id, 'Sorting', 'Arranging elements in order.', 'advanced')
  ON CONFLICT (id) DO NOTHING;

  -- 5. Concept Dependencies
  INSERT INTO public.concept_dependencies (concept_id, prerequisite_id)
  VALUES 
    (c_searching, c_arrays),
    (c_bigo, c_searching),
    (c_bigo, c_logarithms),
    (c_binary_search, c_arrays),
    (c_binary_search, c_bigo),
    (c_binary_search, c_logarithms)
  ON CONFLICT DO NOTHING;

  -- 6. Demo Confusion Signals
  INSERT INTO public.confusion_signals (student_id, concept_id, signal, created_at)
  VALUES 
    (student_id, c_bigo, 'Confused', NOW() - INTERVAL '2 hours'),
    (student_id, c_binary_search, 'Partially Clear', NOW() - INTERVAL '1 day')
  ON CONFLICT DO NOTHING;

  -- 7. Mastery Scores
  INSERT INTO public.mastery_scores (student_id, concept_id, score)
  VALUES 
    (student_id, c_arrays, 95.0),
    (student_id, c_searching, 85.0),
    (student_id, c_logarithms, 40.0),
    (student_id, c_bigo, 30.0),
    (student_id, c_binary_search, 10.0)
  ON CONFLICT DO NOTHING;

  -- 8. Revision Plans
  INSERT INTO public.revision_plans (student_id, concept_id, priority, minutes)
  VALUES 
    (student_id, c_logarithms, 'High', 6),
    (student_id, c_bigo, 'High', 8),
    (student_id, c_binary_search, 'Medium', 12)
  ON CONFLICT DO NOTHING;

  -- 9. Course Enrollments
  INSERT INTO public.course_enrollments (student_id, course_id)
  VALUES (student_id, course_id)
  ON CONFLICT DO NOTHING;

  -- 10. Learning Sessions
  INSERT INTO public.learning_sessions (student_id, session_type, duration_minutes, created_at)
  VALUES 
    (student_id, 'lesson', 25, NOW() - INTERVAL '1 day'),
    (student_id, 'tutor', 15, NOW() - INTERVAL '2 hours'),
    (student_id, 'practice', 20, NOW() - INTERVAL '3 days')
  ON CONFLICT DO NOTHING;

  -- 11. Practice Questions
  INSERT INTO public.practice_questions (concept_id, question_type, question_text, options, correct_answer, explanation)
  VALUES 
    (c_binary_search, 'mcq', 'What is the time complexity of binary search?', 
     '["O(n)", "O(log n)", "O(n^2)", "O(1)"]'::jsonb, 
     'O(log n)', 
     'Binary search divides the search space in half each iteration, resulting in logarithmic time complexity.'),
    (c_bigo, 'true_false', 'O(n) is faster than O(log n) for large inputs.', 
     '["True", "False"]'::jsonb, 
     'False', 
     'O(log n) grows much slower than O(n), making it faster for large inputs.'),
    (c_arrays, 'mcq', 'What is the time complexity of accessing an element by index in an array?',
     '["O(n)", "O(log n)", "O(n^2)", "O(1)"]'::jsonb,
     'O(1)',
     'Arrays provide constant-time access to elements by index.')
  ON CONFLICT DO NOTHING;

  -- 12. Practice Attempts (some correct, some incorrect)
  INSERT INTO public.practice_attempts (student_id, concept_id, correct, created_at)
  VALUES 
    (student_id, c_arrays, TRUE, NOW() - INTERVAL '2 days'),
    (student_id, c_arrays, TRUE, NOW() - INTERVAL '2 days'),
    (student_id, c_searching, TRUE, NOW() - INTERVAL '1 day'),
    (student_id, c_bigo, FALSE, NOW() - INTERVAL '1 day'),
    (student_id, c_bigo, FALSE, NOW() - INTERVAL '6 hours'),
    (student_id, c_binary_search, FALSE, NOW() - INTERVAL '3 hours')
  ON CONFLICT DO NOTHING;

  -- 13. Notifications
  INSERT INTO public.notifications (user_id, type, message, read, created_at)
  VALUES 
    (student_id, 'clarity_plan', 'Your Clarity Plan is ready.', FALSE, NOW() - INTERVAL '1 hour'),
    (student_id, 'improvement', 'Binary Search improved to 15%!', FALSE, NOW() - INTERVAL '2 hours'),
    (student_id, 'attention', '3 concepts still need attention.', TRUE, NOW() - INTERVAL '1 day')
  ON CONFLICT DO NOTHING;

  --------------------------------
  -- EXTENDED CURRICULUM (7 MORE COURSES)
  --------------------------------

  -- Course IDs
  DECLARE
    c_dsa UUID := '11111111-1111-1111-1111-111111111112'; -- CSE2101 (reusing DSA)
    c_dbms UUID := '11111111-1111-1111-1111-111111111113'; -- CSE2102
    c_coa UUID := '11111111-1111-1111-1111-111111111114'; -- CSE2103
    c_daa UUID := '11111111-1111-1111-1111-111111111115'; -- CSE2201
    c_os UUID := '11111111-1111-1111-1111-111111111116'; -- CSE2202
    c_networks UUID := '11111111-1111-1111-1111-111111111117'; -- CSE3101
    c_se UUID := '11111111-1111-1111-1111-111111111118'; -- CSE3102
    c_ml UUID := '11111111-1111-1111-1111-111111111119'; -- CSE3201

  -- CSE2101 Lesson IDs (extend existing)
    dsa_l1 UUID := '22222222-2222-2222-2222-222222222222';
    dsa_l3 UUID := '22222222-2222-2222-2222-222222222223';
    dsa_l4 UUID := '22222222-2222-2222-2222-222222222224';
    dsa_l5 UUID := '22222222-2222-2222-2222-222222222225';

  -- CSE2102 Lesson IDs
    dbms_l1 UUID := '22222222-2222-2222-2222-222222222231';
    dbms_l2 UUID := '22222222-2222-2222-2222-222222222232';
    dbms_l3 UUID := '22222222-2222-2222-2222-222222222233';
    dbms_l4 UUID := '22222222-2222-2222-2222-222222222234';

  -- CSE2103 Lesson IDs
    coa_l1 UUID := '22222222-2222-2222-2222-222222222241';
    coa_l2 UUID := '22222222-2222-2222-2222-222222222242';
    coa_l3 UUID := '22222222-2222-2222-2222-222222222243';
    coa_l4 UUID := '22222222-2222-2222-2222-222222222244';

  -- CSE2201 Lesson IDs
    daa_l1 UUID := '22222222-2222-2222-2222-222222222251';
    daa_l2 UUID := '22222222-2222-2222-2222-222222222252';
    daa_l3 UUID := '22222222-2222-2222-2222-222222222253';
    daa_l4 UUID := '22222222-2222-2222-2222-222222222254';

  -- CSE2202 Lesson IDs
    os_l1 UUID := '22222222-2222-2222-2222-222222222261';
    os_l2 UUID := '22222222-2222-2222-2222-222222222262';
    os_l3 UUID := '22222222-2222-2222-2222-222222222263';
    os_l4 UUID := '22222222-2222-2222-2222-222222222264';

  -- CSE3101 Lesson IDs
    net_l1 UUID := '22222222-2222-2222-2222-222222222271';
    net_l2 UUID := '22222222-2222-2222-2222-222222222272';
    net_l3 UUID := '22222222-2222-2222-2222-222222222273';
    net_l4 UUID := '22222222-2222-2222-2222-222222222274';

  -- CSE3102 Lesson IDs
    se_l1 UUID := '22222222-2222-2222-2222-222222222281';
    se_l2 UUID := '22222222-2222-2222-2222-222222222282';
    se_l3 UUID := '22222222-2222-2222-2222-222222222283';
    se_l4 UUID := '22222222-2222-2222-2222-222222222284';

  -- CSE3201 Lesson IDs
    ml_l1 UUID := '22222222-2222-2222-2222-222222222291';
    ml_l2 UUID := '22222222-2222-2222-2222-222222222292';
    ml_l3 UUID := '22222222-2222-2222-2222-222222222293';
    ml_l4 UUID := '22222222-2222-2222-2222-222222222294';

  -- CSE2101 Concept IDs (extending existing - prefix 44xxx for new lessons)
    dsa_c_linked_lists UUID := '44444444-4444-4444-4444-444444444401';
    dsa_c_stacks UUID := '44444444-4444-4444-4444-444444444402';
    dsa_c_queues UUID := '44444444-4444-4444-4444-444444444403';
    dsa_c_binary_trees UUID := '44444444-4444-4444-4444-444444444404';
    dsa_c_bst UUID := '44444444-4444-4444-4444-444444444405';
    dsa_c_tree_traversals UUID := '44444444-4444-4444-4444-444444444406';
    dsa_c_balanced_trees UUID := '44444444-4444-4444-4444-444444444407';
    dsa_c_graph_rep UUID := '44444444-4444-4444-4444-444444444408';
    dsa_c_bfs_dfs UUID := '44444444-4444-4444-4444-444444444409';
    dsa_c_shortest_path UUID := '44444444-4444-4444-4444-444444444410';
    dsa_c_mst UUID := '44444444-4444-4444-4444-444444444411';
    dsa_c_hashing UUID := '44444444-4444-4444-4444-444444444412';
    dsa_c_load_factor UUID := '44444444-4444-4444-4444-444444444413';

  -- CSE2102 Concept IDs (prefix 55xxx)
    dbms_c_tables_keys UUID := '55555555-5555-5555-5555-555555555501';
    dbms_c_relationships UUID := '55555555-5555-5555-5555-555555555502';
    dbms_c_er_diagrams UUID := '55555555-5555-5555-5555-555555555503';
    dbms_c_select UUID := '55555555-5555-5555-5555-555555555504';
    dbms_c_joins UUID := '55555555-5555-5555-5555-555555555505';
    dbms_c_aggregates UUID := '55555555-5555-5555-5555-555555555506';
    dbms_c_subqueries UUID := '55555555-5555-5555-5555-555555555507';
    dbms_c_normalization UUID := '55555555-5555-5555-5555-555555555508';
    dbms_c_bcnf UUID := '55555555-5555-5555-5555-555555555509';
    dbms_c_denorm UUID := '55555555-5555-5555-5555-555555555510';
    dbms_c_acid UUID := '55555555-5555-5555-5555-555555555511';
    dbms_c_indexing UUID := '55555555-5555-5555-5555-555555555512';
    dbms_c_query_opt UUID := '55555555-5555-5555-5555-555555555513';
    dbms_c_concurrency UUID := '55555555-5555-5555-5555-555555555514';

  -- CSE2103 Concept IDs (prefix 66xxx)
    coa_c_number_sys UUID := '66666666-6666-6666-6666-666666666601';
    coa_c_logic_gates UUID := '66666666-6666-6666-6666-666666666602';
    coa_c_combinational UUID := '66666666-6666-6666-6666-666666666603';
    coa_c_isa UUID := '66666666-6666-6666-6666-666666666604';
    coa_c_datapath UUID := '66666666-6666-6666-6666-666666666605';
    coa_c_pipelining UUID := '66666666-6666-6666-6666-666666666606';
    coa_c_cache UUID := '66666666-6666-6666-6666-666666666607';
    coa_c_cache_mapping UUID := '66666666-6666-6666-6666-666666666608';
    coa_c_virtual_mem UUID := '66666666-6666-6666-6666-666666666609';
    coa_c_io UUID := '66666666-6666-6666-6666-666666666610';
    coa_c_perf_metrics UUID := '66666666-6666-6666-6666-666666666611';

  -- CSE2201 Concept IDs (prefix 77xxx)
    daa_c_divide_conquer UUID := '77777777-7777-7777-7777-777777777701';
    daa_c_recurrence UUID := '77777777-7777-7777-7777-777777777702';
    daa_c_greedy UUID := '77777777-7777-7777-7777-777777777703';
    daa_c_memoization UUID := '77777777-7777-7777-7777-777777777704';
    daa_c_dp_problems UUID := '77777777-7777-7777-7777-777777777705';
    daa_c_dp_graphs UUID := '77777777-7777-7777-7777-777777777706';
    daa_c_topo_sort UUID := '77777777-7777-7777-7777-777777777707';
    daa_c_scc UUID := '77777777-7777-7777-7777-777777777708';
    daa_c_network_flow UUID := '77777777-7777-7777-7777-777777777709';
    daa_c_np_complete UUID := '77777777-7777-7777-7777-777777777710';
    daa_c_approx_algo UUID := '77777777-7777-7777-7777-777777777711';

  -- CSE2202 Concept IDs (prefix 88xxx)
    os_c_what_is_os UUID := '88888888-8888-8888-8888-888888888801';
    os_c_syscalls UUID := '88888888-8888-8888-8888-888888888802';
    os_c_proc_threads UUID := '88888888-8888-8888-8888-888888888803';
    os_c_scheduling UUID := '88888888-8888-8888-8888-888888888804';
    os_c_context_switch UUID := '88888888-8888-8888-8888-888888888805';
    os_c_race_conditions UUID := '88888888-8888-8888-8888-888888888806';
    os_c_semaphores UUID := '88888888-8888-8888-8888-888888888807';
    os_c_deadlocks UUID := '88888888-8888-8888-8888-888888888808';
    os_c_paging UUID := '88888888-8888-8888-8888-888888888809';
    os_c_page_replacement UUID := '88888888-8888-8888-8888-888888888810';

  -- CSE3101 Concept IDs (prefix 99xxx)
    net_c_osi UUID := '99999999-9999-9999-9999-999999999901';
    net_c_tcpip UUID := '99999999-9999-9999-9999-999999999902';
    net_c_tcp_udp UUID := '99999999-9999-9999-9999-999999999903';
    net_c_http UUID := '99999999-9999-9999-9999-999999999904';
    net_c_dns UUID := '99999999-9999-9999-9999-999999999905';
    net_c_ip_addr UUID := '99999999-9999-9999-9999-999999999906';
    net_c_routing UUID := '99999999-9999-9999-9999-999999999907';
    net_c_nat UUID := '99999999-9999-9999-9999-999999999908';
    net_c_firewalls UUID := '99999999-9999-9999-9999-999999999909';
    net_c_tls UUID := '99999999-9999-9999-9999-999999999910';
    net_c_attacks UUID := '99999999-9999-9999-9999-999999999911';

  -- CSE3102 Concept IDs (prefix aaaaa)
    se_c_sdlc UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa901';
    se_c_agile UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa902';
    se_c_waterfall UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa903';
    se_c_requirements UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa904';
    se_c_uml UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa905';
    se_c_design_patterns UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa906';
    se_c_unit_testing UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa907';
    se_c_tdd UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa908';
    se_c_code_coverage UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa909';
    se_c_modularity UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa910';
    se_c_version_control UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa911';
    se_c_cicd UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa912';

  -- CSE3201 Concept IDs (prefix bbbbb)
    ml_c_what_is_ml UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01';
    ml_c_train_test UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02';
    ml_c_eval_metrics UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03';
    ml_c_linear_reg UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04';
    ml_c_decision_trees UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb05';
    ml_c_svm UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb06';
    ml_c_kmeans UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb07';
    ml_c_pca UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb08';
    ml_c_perceptron UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb09';
    ml_c_backprop UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb10';
    ml_c_cnn_rnn UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11';

BEGIN

  -- Note: The CS101 course and Lesson 1 data remain unchanged above

  -- ========================================
  -- CSE2101: Data Structures and Algorithms (EXTEND)
  -- ========================================
  -- Update existing CS101 to CSE2101
  UPDATE public.courses SET code = 'CSE2101', name = 'Data Structures and Algorithms' WHERE id = course_id;

  -- Add Lesson 1: Linear Structures (order 1, before the existing Searching lesson)
  UPDATE public.lessons SET order_number = 2 WHERE id = lesson1_id; -- Move existing lesson to order 2
  INSERT INTO public.lessons (id, course_id, title, description, order_number)
  VALUES (dsa_l1, course_id, 'Linear Structures', 'Foundational linear data structures.', 1)
  ON CONFLICT (id) DO NOTHING;

  -- Lesson 1 Concepts
  INSERT INTO public.concepts (id, lesson_id, name, description, difficulty)
  VALUES 
    -- Arrays already exists as c_arrays, just ensure it's in the right lesson
    (dsa_c_linked_lists, dsa_l1, 'Linked Lists', 'Singly and doubly linked lists.', 'beginner'),
    (dsa_c_stacks, dsa_l1, 'Stacks', 'LIFO data structure.', 'beginner'),
    (dsa_c_queues, dsa_l1, 'Queues', 'FIFO data structure.', 'beginner')
  ON CONFLICT (id) DO NOTHING;

  -- Move Arrays to Lesson 1
  UPDATE public.concepts SET lesson_id = dsa_l1 WHERE id = c_arrays;

  -- Add Lesson 3: Trees
  INSERT INTO public.lessons (id, course_id, title, description, order_number)
  VALUES (dsa_l3, course_id, 'Trees', 'Tree data structures and traversals.', 3)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.concepts (id, lesson_id, name, description, difficulty)
  VALUES 
    (dsa_c_binary_trees, dsa_l3, 'Binary Trees', 'Tree structures with at most two children per node.', 'intermediate'),
    (dsa_c_bst, dsa_l3, 'Binary Search Trees', 'Ordered binary trees for efficient search.', 'intermediate'),
    (dsa_c_tree_traversals, dsa_l3, 'Tree Traversals', 'In-order, pre-order, post-order traversals.', 'intermediate'),
    (dsa_c_balanced_trees, dsa_l3, 'Balanced Trees', 'AVL and Red-Black tree concepts.', 'advanced')
  ON CONFLICT (id) DO NOTHING;

  -- Add Lesson 4: Graphs
  INSERT INTO public.lessons (id, course_id, title, description, order_number)
  VALUES (dsa_l4, course_id, 'Graphs', 'Graph representations and algorithms.', 4)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.concepts (id, lesson_id, name, description, difficulty)
  VALUES 
    (dsa_c_graph_rep, dsa_l4, 'Graph Representations', 'Adjacency list and matrix representations.', 'intermediate'),
    (dsa_c_bfs_dfs, dsa_l4, 'BFS/DFS', 'Breadth-first and depth-first search algorithms.', 'intermediate'),
    (dsa_c_shortest_path, dsa_l4, 'Shortest Path', 'Dijkstra''s algorithm for shortest paths.', 'advanced'),
    (dsa_c_mst, dsa_l4, 'Minimum Spanning Trees', 'Kruskal and Prim algorithms.', 'advanced')
  ON CONFLICT (id) DO NOTHING;

  -- Add Lesson 5: Hash Tables
  INSERT INTO public.lessons (id, course_id, title, description, order_number)
  VALUES (dsa_l5, course_id, 'Hash Tables', 'Hashing and collision resolution.', 5)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.concepts (id, lesson_id, name, description, difficulty)
  VALUES 
    (dsa_c_hashing, dsa_l5, 'Hashing & Collision Handling', 'Hash functions and collision resolution strategies.', 'intermediate'),
    (dsa_c_load_factor, dsa_l5, 'Load Factor & Resizing', 'Dynamic resizing of hash tables.', 'advanced')
  ON CONFLICT (id) DO NOTHING;

  -- CSE2101 Dependencies
  INSERT INTO public.concept_dependencies (concept_id, prerequisite_id)
  VALUES 
    (dsa_c_bst, dsa_c_binary_trees),
    (dsa_c_tree_traversals, dsa_c_binary_trees),
    (dsa_c_bfs_dfs, dsa_c_graph_rep),
    (dsa_c_shortest_path, dsa_c_bfs_dfs),
    (dsa_c_hashing, c_arrays)
  ON CONFLICT DO NOTHING;

  -- ========================================
  -- CSE2102: Relational Database Management System
  -- ========================================
  INSERT INTO public.courses (id, name, code, description, educator_id)
  VALUES (c_dbms, 'Relational Database Management System', 'CSE2102', 'SQL, normalization, and database architecture.', educator_id)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.lessons (id, course_id, title, description, order_number)
  VALUES 
    (dbms_l1, c_dbms, 'Relational Model Foundations', 'Tables, keys, and relationships.', 1),
    (dbms_l2, c_dbms, 'SQL Fundamentals', 'Querying and manipulating data.', 2),
    (dbms_l3, c_dbms, 'Normalization', 'Database design and normal forms.', 3),
    (dbms_l4, c_dbms, 'Transactions & Architecture', 'ACID, indexing, and optimization.', 4)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.concepts (id, lesson_id, name, description, difficulty)
  VALUES 
    (dbms_c_tables_keys, dbms_l1, 'Tables, Rows, Keys', 'Primary and foreign keys in relational databases.', 'beginner'),
    (dbms_c_relationships, dbms_l1, 'Relationships', '1:1, 1:N, M:N relationships.', 'beginner'),
    (dbms_c_er_diagrams, dbms_l1, 'ER Diagrams', 'Entity-relationship modeling.', 'beginner'),
    (dbms_c_select, dbms_l2, 'SELECT/WHERE/ORDER BY', 'Basic SQL queries.', 'beginner'),
    (dbms_c_joins, dbms_l2, 'Joins', 'INNER, LEFT, RIGHT, FULL joins.', 'intermediate'),
    (dbms_c_aggregates, dbms_l2, 'Aggregate Functions & GROUP BY', 'SUM, COUNT, AVG, and grouping.', 'intermediate'),
    (dbms_c_subqueries, dbms_l2, 'Subqueries', 'Nested queries.', 'advanced'),
    (dbms_c_normalization, dbms_l3, '1NF, 2NF, 3NF', 'Database normalization forms.', 'intermediate'),
    (dbms_c_bcnf, dbms_l3, 'BCNF', 'Boyce-Codd Normal Form.', 'advanced'),
    (dbms_c_denorm, dbms_l3, 'Denormalization Tradeoffs', 'When to denormalize.', 'advanced'),
    (dbms_c_acid, dbms_l4, 'ACID Properties', 'Atomicity, Consistency, Isolation, Durability.', 'intermediate'),
    (dbms_c_indexing, dbms_l4, 'Indexing', 'Database indexes for performance.', 'intermediate'),
    (dbms_c_query_opt, dbms_l4, 'Query Optimization', 'Optimizing query performance.', 'advanced'),
    (dbms_c_concurrency, dbms_l4, 'Concurrency Control', 'Locking mechanisms.', 'advanced')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.concept_dependencies (concept_id, prerequisite_id)
  VALUES 
    (dbms_c_joins, dbms_c_tables_keys),
    (dbms_c_normalization, dbms_c_relationships),
    (dbms_c_query_opt, dbms_c_indexing),
    (dbms_c_concurrency, dbms_c_acid)
  ON CONFLICT DO NOTHING;

  -- ========================================
  -- CSE2103: Computer Organization & Architecture
  -- ========================================
  INSERT INTO public.courses (id, name, code, description, educator_id)
  VALUES (c_coa, 'Computer Organization & Architecture', 'CSE2103', 'Internal workings of computer systems.', educator_id)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.lessons (id, course_id, title, description, order_number)
  VALUES 
    (coa_l1, c_coa, 'Digital Logic Foundations', 'Number systems and logic gates.', 1),
    (coa_l2, c_coa, 'CPU Architecture', 'Instruction sets and pipelining.', 2),
    (coa_l3, c_coa, 'Memory Hierarchy', 'Cache and virtual memory.', 3),
    (coa_l4, c_coa, 'I/O and Performance', 'I/O systems and performance metrics.', 4)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.concepts (id, lesson_id, name, description, difficulty)
  VALUES 
    (coa_c_number_sys, coa_l1, 'Number Systems & Boolean Algebra', 'Binary, hexadecimal, and Boolean operations.', 'beginner'),
    (coa_c_logic_gates, coa_l1, 'Logic Gates', 'AND, OR, NOT, XOR gates.', 'beginner'),
    (coa_c_combinational, coa_l1, 'Combinational Circuits', 'Adders, multiplexers, decoders.', 'intermediate'),
    (coa_c_isa, coa_l2, 'Instruction Set Architecture', 'RISC vs CISC architectures.', 'intermediate'),
    (coa_c_datapath, coa_l2, 'Datapath & Control Unit', 'CPU components and control signals.', 'intermediate'),
    (coa_c_pipelining, coa_l2, 'Pipelining', 'Instruction pipelining and hazards.', 'advanced'),
    (coa_c_cache, coa_l3, 'Cache Memory', 'Cache levels and hit/miss rates.', 'intermediate'),
    (coa_c_cache_mapping, coa_l3, 'Cache Mapping Techniques', 'Direct, associative, set-associative mapping.', 'advanced'),
    (coa_c_virtual_mem, coa_l3, 'Virtual Memory', 'Address translation and paging.', 'advanced'),
    (coa_c_io, coa_l4, 'I/O Systems & Interrupts', 'Input/output handling.', 'intermediate'),
    (coa_c_perf_metrics, coa_l4, 'Performance Metrics', 'CPI, throughput, latency.', 'advanced')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.concept_dependencies (concept_id, prerequisite_id)
  VALUES 
    (coa_c_pipelining, coa_c_datapath),
    (coa_c_cache_mapping, coa_c_cache),
    (coa_c_virtual_mem, coa_c_cache)
  ON CONFLICT DO NOTHING;

  -- ========================================
  -- CSE2201: Design and Analysis of Algorithms
  -- ========================================
  INSERT INTO public.courses (id, name, code, description, educator_id)
  VALUES (c_daa, 'Design and Analysis of Algorithms', 'CSE2201', 'Advanced algorithm design paradigms.', educator_id)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.lessons (id, course_id, title, description, order_number)
  VALUES 
    (daa_l1, c_daa, 'Algorithmic Paradigms I', 'Divide and conquer, greedy algorithms.', 1),
    (daa_l2, c_daa, 'Dynamic Programming', 'Memoization and classic DP problems.', 2),
    (daa_l3, c_daa, 'Graph Theory (Advanced)', 'Advanced graph algorithms.', 3),
    (daa_l4, c_daa, 'Complexity Theory', 'NP-completeness and approximation.', 4)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.concepts (id, lesson_id, name, description, difficulty)
  VALUES 
    (daa_c_divide_conquer, daa_l1, 'Divide and Conquer', 'Breaking problems into subproblems.', 'intermediate'),
    (daa_c_recurrence, daa_l1, 'Recurrence Relations', 'Master Theorem for analyzing recurrences.', 'advanced'),
    (daa_c_greedy, daa_l1, 'Greedy Algorithms', 'Locally optimal choices.', 'intermediate'),
    (daa_c_memoization, daa_l2, 'Memoization vs Tabulation', 'Top-down vs bottom-up DP.', 'intermediate'),
    (daa_c_dp_problems, daa_l2, 'Classic DP Problems', 'Knapsack, LCS, and other DP problems.', 'advanced'),
    (daa_c_dp_graphs, daa_l2, 'DP on Graphs', 'Dynamic programming on graph structures.', 'advanced'),
    (daa_c_topo_sort, daa_l3, 'Topological Sort', 'Ordering of directed acyclic graphs.', 'intermediate'),
    (daa_c_scc, daa_l3, 'Strongly Connected Components', 'Finding SCCs in directed graphs.', 'advanced'),
    (daa_c_network_flow, daa_l3, 'Network Flow', 'Max flow and min cut algorithms.', 'advanced'),
    (daa_c_np_complete, daa_l4, 'NP-Completeness', 'Computational complexity classes.', 'advanced'),
    (daa_c_approx_algo, daa_l4, 'Approximation Algorithms', 'Near-optimal solutions for hard problems.', 'advanced')
  ON CONFLICT (id) DO NOTHING;

  -- CSE2201 Cross-course Dependencies (Critical!)
  INSERT INTO public.concept_dependencies (concept_id, prerequisite_id)
  VALUES 
    (daa_c_divide_conquer, c_bigo), -- DAA → DSA
    (daa_c_memoization, c_recursion), -- DAA → DSA
    (daa_c_dp_graphs, dsa_c_bfs_dfs) -- DAA → DSA
  ON CONFLICT DO NOTHING;

  -- ========================================
  -- CSE2202: Operating Systems
  -- ========================================
  INSERT INTO public.courses (id, name, code, description, educator_id)
  VALUES (c_os, 'Operating Systems', 'CSE2202', 'Process management, concurrency, and memory.', educator_id)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.lessons (id, course_id, title, description, order_number)
  VALUES 
    (os_l1, c_os, 'OS Fundamentals', 'Roles and types of operating systems.', 1),
    (os_l2, c_os, 'Process Management', 'Processes, threads, and scheduling.', 2),
    (os_l3, c_os, 'Concurrency', 'Synchronization and deadlocks.', 3),
    (os_l4, c_os, 'Memory Management', 'Paging and virtual memory.', 4)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.concepts (id, lesson_id, name, description, difficulty)
  VALUES 
    (os_c_what_is_os, os_l1, 'What is an OS', 'Roles and types of operating systems.', 'beginner'),
    (os_c_syscalls, os_l1, 'System Calls', 'Interface between programs and OS.', 'beginner'),
    (os_c_proc_threads, os_l2, 'Processes vs Threads', 'Differences and use cases.', 'intermediate'),
    (os_c_scheduling, os_l2, 'Process Scheduling', 'FCFS, SJF, Round Robin algorithms.', 'intermediate'),
    (os_c_context_switch, os_l2, 'Context Switching', 'Overhead of switching between processes.', 'advanced'),
    (os_c_race_conditions, os_l3, 'Race Conditions & Critical Sections', 'Concurrency issues.', 'intermediate'),
    (os_c_semaphores, os_l3, 'Semaphores & Mutexes', 'Synchronization primitives.', 'advanced'),
    (os_c_deadlocks, os_l3, 'Deadlocks', 'Detection and prevention strategies.', 'advanced'),
    (os_c_paging, os_l4, 'Paging & Segmentation', 'Memory management techniques.', 'intermediate'),
    (os_c_page_replacement, os_l4, 'Virtual Memory & Page Replacement', 'Page replacement algorithms.', 'advanced')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.concept_dependencies (concept_id, prerequisite_id)
  VALUES 
    (os_c_deadlocks, os_c_semaphores),
    (os_c_context_switch, os_c_scheduling),
    (os_c_page_replacement, os_c_paging)
  ON CONFLICT DO NOTHING;

  -- ========================================
  -- CSE3101: Computer Networks
  -- ========================================
  INSERT INTO public.courses (id, name, code, description, educator_id)
  VALUES (c_networks, 'Computer Networks', 'CSE3101', 'Network models, protocols, and security.', educator_id)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.lessons (id, course_id, title, description, order_number)
  VALUES 
    (net_l1, c_networks, 'Network Models', 'OSI and TCP/IP models.', 1),
    (net_l2, c_networks, 'Core Protocols', 'TCP, UDP, HTTP, DNS.', 2),
    (net_l3, c_networks, 'Routing & Addressing', 'IP addressing and routing algorithms.', 3),
    (net_l4, c_networks, 'Network Security', 'Firewalls, VPNs, and encryption.', 4)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.concepts (id, lesson_id, name, description, difficulty)
  VALUES 
    (net_c_osi, net_l1, 'OSI Model', 'Seven-layer network model.', 'beginner'),
    (net_c_tcpip, net_l1, 'TCP/IP Model', 'Internet protocol suite.', 'beginner'),
    (net_c_tcp_udp, net_l2, 'TCP vs UDP', 'Connection-oriented vs connectionless.', 'intermediate'),
    (net_c_http, net_l2, 'HTTP/HTTPS', 'Web protocol fundamentals.', 'beginner'),
    (net_c_dns, net_l2, 'DNS', 'Domain name system.', 'intermediate'),
    (net_c_ip_addr, net_l3, 'IP Addressing & Subnetting', 'IPv4/IPv6 addressing schemes.', 'intermediate'),
    (net_c_routing, net_l3, 'Routing Algorithms', 'Distance Vector and Link State routing.', 'advanced'),
    (net_c_nat, net_l3, 'NAT', 'Network Address Translation.', 'intermediate'),
    (net_c_firewalls, net_l4, 'Firewalls & VPNs', 'Network security perimeters.', 'intermediate'),
    (net_c_tls, net_l4, 'Encryption in Transit', 'TLS/SSL protocols.', 'advanced'),
    (net_c_attacks, net_l4, 'Common Attacks', 'DDoS, MITM, and other network attacks.', 'advanced')
  ON CONFLICT (id) DO NOTHING;

  -- CSE3101 Cross-course Dependencies
  INSERT INTO public.concept_dependencies (concept_id, prerequisite_id)
  VALUES 
    (net_c_tcp_udp, net_c_osi),
    (net_c_routing, net_c_ip_addr),
    (net_c_tls, net_c_http)
  ON CONFLICT DO NOTHING;

  -- ========================================
  -- CSE3102: Software Engineering
  -- ========================================
  INSERT INTO public.courses (id, name, code, description, educator_id)
  VALUES (c_se, 'Software Engineering', 'CSE3102', 'SDLC, design patterns, testing, and system design.', educator_id)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.lessons (id, course_id, title, description, order_number)
  VALUES 
    (se_l1, c_se, 'Process Models', 'SDLC, Agile, and Waterfall.', 1),
    (se_l2, c_se, 'Requirements & Design', 'Requirements gathering and UML.', 2),
    (se_l3, c_se, 'Testing', 'Unit testing, TDD, and code coverage.', 3),
    (se_l4, c_se, 'System Design Basics', 'Modularity and CI/CD.', 4)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.concepts (id, lesson_id, name, description, difficulty)
  VALUES 
    (se_c_sdlc, se_l1, 'SDLC Overview', 'Software Development Life Cycle.', 'beginner'),
    (se_c_agile, se_l1, 'Agile & Scrum', 'Iterative development methodologies.', 'beginner'),
    (se_c_waterfall, se_l1, 'Waterfall vs Agile', 'Comparing development approaches.', 'intermediate'),
    (se_c_requirements, se_l2, 'Requirements Gathering', 'Eliciting and documenting requirements.', 'beginner'),
    (se_c_uml, se_l2, 'UML Diagrams', 'Class and sequence diagrams.', 'intermediate'),
    (se_c_design_patterns, se_l2, 'Design Patterns', 'Singleton, Factory, Observer patterns.', 'advanced'),
    (se_c_unit_testing, se_l3, 'Unit vs Integration Testing', 'Testing strategies.', 'intermediate'),
    (se_c_tdd, se_l3, 'Test-Driven Development', 'Writing tests before code.', 'intermediate'),
    (se_c_code_coverage, se_l3, 'Code Coverage & Debugging', 'Measuring test effectiveness.', 'advanced'),
    (se_c_modularity, se_l4, 'Modularity & Coupling/Cohesion', 'Software design principles.', 'intermediate'),
    (se_c_version_control, se_l4, 'Version Control', 'Git workflows and branching.', 'beginner'),
    (se_c_cicd, se_l4, 'CI/CD Basics', 'Continuous Integration and Deployment.', 'advanced')
  ON CONFLICT (id) DO NOTHING;

  -- CSE3102 Cross-course Dependencies
  INSERT INTO public.concept_dependencies (concept_id, prerequisite_id)
  VALUES 
    (se_c_design_patterns, se_c_uml),
    (se_c_tdd, se_c_unit_testing),
    (se_c_cicd, se_c_version_control)
  ON CONFLICT DO NOTHING;

  -- ========================================
  -- CSE3201: Machine Learning
  -- ========================================
  INSERT INTO public.courses (id, name, code, description, educator_id)
  VALUES (c_ml, 'Machine Learning', 'CSE3201', 'ML fundamentals, supervised/unsupervised learning, neural networks.', educator_id)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.lessons (id, course_id, title, description, order_number)
  VALUES 
    (ml_l1, c_ml, 'ML Foundations', 'Introduction to machine learning.', 1),
    (ml_l2, c_ml, 'Supervised Learning', 'Regression, classification algorithms.', 2),
    (ml_l3, c_ml, 'Unsupervised Learning', 'Clustering and dimensionality reduction.', 3),
    (ml_l4, c_ml, 'Neural Networks', 'Deep learning basics.', 4)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.concepts (id, lesson_id, name, description, difficulty)
  VALUES 
    (ml_c_what_is_ml, ml_l1, 'What is ML', 'Supervised, unsupervised, reinforcement learning.', 'beginner'),
    (ml_c_train_test, ml_l1, 'Train/Test Split & Overfitting', 'Model validation techniques.', 'beginner'),
    (ml_c_eval_metrics, ml_l1, 'Evaluation Metrics', 'Accuracy, precision, recall, F1-score.', 'intermediate'),
    (ml_c_linear_reg, ml_l2, 'Linear & Logistic Regression', 'Basic regression models.', 'intermediate'),
    (ml_c_decision_trees, ml_l2, 'Decision Trees', 'Tree-based classification.', 'intermediate'),
    (ml_c_svm, ml_l2, 'Support Vector Machines', 'Margin-based classification.', 'advanced'),
    (ml_c_kmeans, ml_l3, 'K-Means Clustering', 'Centroid-based clustering.', 'intermediate'),
    (ml_c_pca, ml_l3, 'Dimensionality Reduction', 'PCA for feature reduction.', 'advanced'),
    (ml_c_perceptron, ml_l4, 'Perceptron & Activation Functions', 'Basic neural network units.', 'intermediate'),
    (ml_c_backprop, ml_l4, 'Backpropagation', 'Training neural networks.', 'advanced'),
    (ml_c_cnn_rnn, ml_l4, 'Basic CNN/RNN Concepts', 'Convolutional and recurrent networks.', 'advanced')
  ON CONFLICT (id) DO NOTHING;

  -- CSE3201 Cross-course Dependencies
  INSERT INTO public.concept_dependencies (concept_id, prerequisite_id)
  VALUES 
    (ml_c_backprop, ml_c_perceptron),
    (ml_c_svm, ml_c_linear_reg),
    (ml_c_pca, ml_c_kmeans)
  ON CONFLICT DO NOTHING;

  -- ========================================
  -- ENROLL DEMO STUDENT IN ALL COURSES
  -- ========================================
  INSERT INTO public.course_enrollments (student_id, course_id)
  VALUES 
    (student_id, c_dbms),
    (student_id, c_coa),
    (student_id, c_daa),
    (student_id, c_os),
    (student_id, c_networks),
    (student_id, c_se),
    (student_id, c_ml)
  ON CONFLICT DO NOTHING;

  END;
END $$;
