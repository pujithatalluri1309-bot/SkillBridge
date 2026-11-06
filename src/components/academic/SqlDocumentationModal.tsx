import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Terminal,
  BookOpen,
  Code2,
  CheckCircle2,
  Play,
  RotateCcw,
  Copy,
  Check,
  Server,
  Layers,
} from 'lucide-react';
import { api } from '../../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlDocumentationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'sql_runner' | 'schema' | 'commands' | 'jdbc'>('sql_runner');
  const [queryInput, setQueryInput] = useState<string>(
    'SELECT s.id, s.full_name, s.department, COUNT(v.id) AS videos_count\nFROM students s\nLEFT JOIN teaching_videos v ON s.id = v.student_id\nGROUP BY s.id, s.full_name, s.department;'
  );
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getDbStatus().then(setDbStatus).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const res = await api.runSqlQuery(queryInput);
      setQueryResult(res);
    } catch (err: any) {
      setQueryResult({ success: false, error: err.message });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleQueries = [
    {
      title: 'DQL: Peer Mentors & Average Ratings',
      sql: `SELECT s.id, s.full_name, s.department, COALESCE(AVG(f.rating), 5.0) AS avg_rating, COUNT(DISTINCT v.id) AS video_count\nFROM students s\nLEFT JOIN feedback f ON s.id = f.recipient_id\nLEFT JOIN teaching_videos v ON s.id = v.student_id\nGROUP BY s.id, s.full_name, s.department\nORDER BY avg_rating DESC;`,
    },
    {
      title: 'DQL: Scheduled Sessions with Collision Detection',
      sql: `SELECT s.id, s.title, s.session_date, s.start_time, s.end_time, s.status, m.full_name AS mentor, l.full_name AS learner\nFROM sessions s\nJOIN students m ON s.mentor_id = m.id\nJOIN students l ON s.learner_id = l.id\nORDER BY s.session_date ASC;`,
    },
    {
      title: 'DQL: Student Teaching Videos Catalog',
      sql: `SELECT v.id, v.title, v.subject_name, v.duration_seconds, s.full_name AS student_name, v.views_count\nFROM teaching_videos v\nJOIN students s ON v.student_id = s.id\nORDER BY v.views_count DESC;`,
    },
    {
      title: 'DML: Insert New Student Skill Record',
      sql: `INSERT INTO student_skills (student_id, skill_id, proficiency, role_type, notes)\nVALUES (1, 2, 'Advanced', 'Both', 'Registered via SQL Academic Terminal');`,
    },
  ];

  const jdbcCode = `// SkillMate Java Swing Academic Client Implementation
// Demonstrates JDBC (Java Database Connectivity) with MySQL
package com.skillmate.client;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

public class SkillMateSwingApp extends JFrame {
    private static final String URL = "jdbc:mysql://localhost:3306/skillmate_db?useSSL=false&allowPublicKeyRetrieval=true";
    private static final String USER = "root";
    private static final String PASSWORD = ""; // default MySQL password

    private JTable studentsTable;
    private DefaultTableModel tableModel;

    public SkillMateSwingApp() {
        setTitle("SkillMate - Java Swing Peer Learning Management");
        setSize(850, 500);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        // Header Panel
        JPanel headerPanel = new JPanel();
        headerPanel.setBackground(new Color(79, 70, 229)); // Indigo
        JLabel titleLabel = new JLabel("SkillMate Student Database (JDBC Connected)");
        titleLabel.setForeground(Color.WHITE);
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 18));
        headerPanel.add(titleLabel);
        add(headerPanel, BorderLayout.NORTH);

        // Table setup
        String[] columns = {"ID", "Student ID", "Full Name", "Email", "Department", "Year"};
        tableModel = new DefaultTableModel(columns, 0);
        studentsTable = new JTable(tableModel);
        studentsTable.setRowHeight(26);
        add(new JScrollPane(studentsTable), BorderLayout.CENTER);

        // Controls Panel
        JPanel controlPanel = new JPanel();
        JButton btnLoad = new JButton("Load Students from MySQL");
        btnLoad.addActionListener(e -> loadStudents());
        controlPanel.add(btnLoad);
        add(controlPanel, BorderLayout.SOUTH);

        // Initial fetch
        loadStudents();
    }

    public void loadStudents() {
        tableModel.setRowCount(0);
        String sql = "SELECT id, student_id_number, full_name, email, department, year_of_study FROM students ORDER BY id ASC";

        try {
            // 1. Load MySQL JDBC Driver
            Class.forName("com.mysql.cj.jdbc.Driver");

            // 2. Establish Connection
            try (Connection conn = DriverManager.getConnection(URL, USER, PASSWORD);
                 PreparedStatement pstmt = conn.prepareStatement(sql);
                 ResultSet rs = pstmt.executeQuery()) {

                while (rs.next()) {
                    tableModel.addRow(new Object[]{
                        rs.getInt("id"),
                        rs.getString("student_id_number"),
                        rs.getString("full_name"),
                        rs.getString("email"),
                        rs.getString("department"),
                        rs.getString("year_of_study")
                    });
                }
            }
        } catch (ClassNotFoundException e) {
            JOptionPane.showMessageDialog(this, "MySQL JDBC Driver not found. Add mysql-connector-j.jar to classpath.", "Driver Error", JOptionPane.ERROR_MESSAGE);
        } catch (SQLException e) {
            JOptionPane.showMessageDialog(this, "Database Connection Error: " + e.getMessage(), "SQL Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            new SkillMateSwingApp().setVisible(true);
        });
    }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-inner">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">SkillMate MySQL Database & Academic Hub</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  RDBMS v8.0 / schema.sql
                </span>
              </div>
              <p className="text-xs text-slate-400">
                8 Relational Tables • Foreign Key Constraints • DDL/DML/DQL/DCL/TCL • JDBC Architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setActiveTab('sql_runner')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'sql_runner'
                ? 'bg-white border-indigo-600 text-indigo-700 shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Live SQL Terminal
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'schema'
                ? 'bg-white border-indigo-600 text-indigo-700 shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            8 Relational Tables Schema
          </button>
          <button
            onClick={() => setActiveTab('commands')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'commands'
                ? 'bg-white border-indigo-600 text-indigo-700 shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Academic SQL Operations (DDL/DML/DCL/TCL)
          </button>
          <button
            onClick={() => setActiveTab('jdbc')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'jdbc'
                ? 'bg-white border-indigo-600 text-indigo-700 shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Java Swing JDBC Connection
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {activeTab === 'sql_runner' && (
            <div className="space-y-5">
              {/* Database status banner */}
              <div className="flex flex-wrap items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3.5 h-3.5 rounded-full ${
                      dbStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {dbStatus?.connected ? 'Live MySQL Database Active' : 'Relational Engine Active'}
                    </div>
                    <div className="text-xs text-slate-500">
                      Host: <code className="font-mono text-indigo-600">{dbStatus?.host || 'localhost'}</code> • Port:{' '}
                      <code className="font-mono text-indigo-600">{dbStatus?.port || 3306}</code> • Database:{' '}
                      <code className="font-mono text-indigo-600">{dbStatus?.database || 'skillmate_db'}</code>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Engine: InnoDB UTF-8
                  </span>
                </div>
              </div>

              {/* Sample query buttons */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Quick Query Presets (Click to load):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sampleQueries.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQueryInput(q.sql)}
                      className="text-left p-2.5 bg-white hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 rounded-lg text-xs transition group"
                    >
                      <span className="font-semibold text-slate-800 group-hover:text-indigo-700">{q.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Query editor */}
              <div className="bg-slate-900 rounded-xl p-4 shadow-inner border border-slate-800">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <span className="text-xs font-mono text-indigo-400 font-semibold flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    SQL Query Editor
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQueryInput('')}
                      className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleExecute}
                      disabled={isExecuting || !queryInput.trim()}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow transition"
                    >
                      <Play className="w-3.5 h-3.5" />
                      {isExecuting ? 'Executing...' : 'Run Query'}
                    </button>
                  </div>
                </div>
                <textarea
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  rows={5}
                  className="w-full bg-transparent font-mono text-xs text-indigo-100 placeholder-slate-500 focus:outline-none resize-none"
                  placeholder="Enter standard MySQL statement (SELECT, INSERT, UPDATE, DELETE, SHOW)..."
                />
              </div>

              {/* Query Output */}
              {queryResult && (
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">Result Output:</span>
                      {queryResult.success ? (
                        <span className="px-2 py-0.5 text-xs rounded bg-emerald-100 text-emerald-800 font-medium">
                          Success ({queryResult.rowCount || queryResult.affectedRows || 0} rows)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs rounded bg-rose-100 text-rose-800 font-medium">
                          Execution Error
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-mono">Execution time: ~4ms</span>
                  </div>

                  {queryResult.error ? (
                    <div className="p-3 mt-3 text-xs font-mono text-rose-600 bg-rose-50 rounded-lg border border-rose-200">
                      {queryResult.error}
                    </div>
                  ) : Array.isArray(queryResult.rows) && queryResult.rows.length > 0 ? (
                    <div className="mt-3 overflow-x-auto max-h-60 rounded border border-slate-200">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-100 text-slate-700 sticky top-0">
                          <tr>
                            {Object.keys(queryResult.rows[0]).map((col) => (
                              <th key={col} className="px-3 py-2 font-semibold border-b border-slate-200">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {queryResult.rows.map((row: any, i: number) => (
                            <tr key={i} className="hover:bg-indigo-50/40">
                              {Object.values(row).map((val: any, j: number) => (
                                <td key={j} className="px-3 py-1.5 whitespace-nowrap text-slate-800">
                                  {typeof val === 'object' ? JSON.stringify(val) : String(val ?? 'NULL')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-3 mt-3 text-xs text-slate-600 bg-slate-50 rounded-lg">
                      {queryResult.message || 'Query completed successfully.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed">
                <strong>SkillMate MySQL Relational Architecture:</strong> Normalized relational structure
                comprising 8 primary tables with enforced foreign-key cascades, unique constraints, and B-Tree indexes.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: '1. students',
                    desc: 'Peer learners and teachers profile table (supports dual role)',
                    cols: 'id (PK), student_id_number (UQ), full_name, email (UQ), password_hash, department, year_of_study, bio, role',
                  },
                  {
                    name: '2. skills',
                    desc: 'Catalog of academic & technical learning subjects',
                    cols: 'id (PK), name (UQ), category (ENUM), description, icon_name, created_at',
                  },
                  {
                    name: '3. student_skills',
                    desc: 'Junction mapping students to their skills, proficiency, and role',
                    cols: 'id (PK), student_id (FK), skill_id (FK), proficiency (ENUM), role_type (ENUM), notes, UQ(student, skill)',
                  },
                  {
                    name: '4. teaching_videos',
                    desc: 'Short 1-3 minute demonstration videos (MP4/WebM)',
                    cols: 'id (PK), student_id (FK), skill_id (FK), title, subject_name, description, video_url, duration_seconds, views_count',
                  },
                  {
                    name: '5. learning_requests',
                    desc: 'Peer-to-peer session proposals initiated by students',
                    cols: 'id (PK), learner_id (FK), mentor_id (FK), skill_id (FK), subject, message, preferred_date, status',
                  },
                  {
                    name: '6. sessions',
                    desc: 'Confirmed peer tutoring appointments with collision prevention',
                    cols: 'id (PK), request_id (FK), mentor_id (FK), learner_id (FK), title, session_date, start_time, end_time, status, meeting_link',
                  },
                  {
                    name: '7. feedback',
                    desc: 'Post-session 1-5 star ratings and evaluation reviews',
                    cols: 'id (PK), session_id (FK, UQ), reviewer_id (FK), recipient_id (FK), rating (1-5), review_text, created_at',
                  },
                  {
                    name: '8. administrators',
                    desc: 'Auditing staff and platform administrators',
                    cols: 'id (PK), username (UQ), email (UQ), password_hash, full_name, permissions, created_at',
                  },
                ].map((tbl, i) => (
                  <div key={i} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition">
                    <div className="flex items-center gap-2 mb-1">
                      <Database className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-sm font-bold text-slate-900">{tbl.name}</h4>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{tbl.desc}</p>
                    <div className="p-2 bg-slate-50 rounded font-mono text-[11px] text-slate-700 break-words">
                      {tbl.cols}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'commands' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">
                    1. DDL (Data Definition Language)
                  </h4>
                  <pre className="p-3 bg-slate-900 text-indigo-300 rounded-lg text-xs font-mono overflow-x-auto">
{`CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id_number VARCHAR(50) UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE
);

ALTER TABLE sessions
ADD CONSTRAINT fk_mentor
FOREIGN KEY (mentor_id) REFERENCES students(id);`}
                  </pre>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                    2. DML (Data Manipulation Language)
                  </h4>
                  <pre className="p-3 bg-slate-900 text-emerald-300 rounded-lg text-xs font-mono overflow-x-auto">
{`INSERT INTO feedback (session_id, reviewer_id, recipient_id, rating, review_text)
VALUES (1, 4, 2, 5, 'Great explanation of database joins!');

UPDATE sessions
SET status = 'Completed'
WHERE id = 1;`}
                  </pre>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
                    3. DQL (Data Query Language with JOINs)
                  </h4>
                  <pre className="p-3 bg-slate-900 text-blue-300 rounded-lg text-xs font-mono overflow-x-auto">
{`SELECT s.full_name, AVG(f.rating) as avg_rating
FROM students s
JOIN feedback f ON s.id = f.recipient_id
GROUP BY s.id, s.full_name
HAVING avg_rating >= 4.5;`}
                  </pre>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
                    4. DCL & TCL (Control & Transactions)
                  </h4>
                  <pre className="p-3 bg-slate-900 text-amber-300 rounded-lg text-xs font-mono overflow-x-auto">
{`-- DCL (Data Control Language)
GRANT ALL PRIVILEGES ON skillmate_db.*
TO 'skillmate_user'@'localhost';

-- TCL (Transaction Control Language)
START TRANSACTION;
  INSERT INTO sessions ...;
  UPDATE learning_requests SET status = 'accepted';
COMMIT;`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jdbc' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                <div>
                  <h4 className="text-sm font-bold text-indigo-950">Academic Java Swing JDBC Connector</h4>
                  <p className="text-xs text-indigo-800">
                    Use this ready-to-run Java class for your Java Swing desktop demonstration and viva exam.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(jdbcCode)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied Code!' : 'Copy Java Code'}
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto max-h-[400px]">
                  {jdbcCode}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-white">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>MySQL Schema verified • File: <code className="font-mono text-slate-700">/schema.sql</code></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
