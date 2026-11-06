import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Trash2,
  Edit2,
  BookOpen,
  CheckCircle,
  Filter,
  Sparkles,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { StudentSkill, Skill, SkillCategory, ProficiencyLevel, SkillRole } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const MySkillsView: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [skillsList, setSkillsList] = useState<StudentSkill[]>([]);
  const [masterCatalog, setMasterCatalog] = useState<Skill[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<StudentSkill | null>(null);

  // Form states
  const [selectedSkillId, setSelectedSkillId] = useState<number | ''>('');
  const [customSkillName, setCustomSkillName] = useState('');
  const [customSkillCategory, setCustomSkillCategory] = useState<SkillCategory>('Programming');
  const [proficiency, setProficiency] = useState<ProficiencyLevel>('Intermediate');
  const [roleType, setRoleType] = useState<SkillRole>('Both');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const categories: SkillCategory[] = [
    'Programming',
    'Database',
    'Web Development',
    'Mathematics',
    'Science',
    'Communication',
    'Design',
    'Other Skills',
  ];

  const loadSkills = async () => {
    if (!user) return;
    try {
      const [userSkills, catalog] = await Promise.all([
        api.getStudentSkills(user.id),
        api.getSkills(),
      ]);
      setSkillsList(userSkills);
      setMasterCatalog(catalog);
    } catch (e) {
      console.error('Failed to load skills', e);
    }
  };

  useEffect(() => {
    loadSkills();
  }, [user]);

  const handleOpenAddModal = () => {
    setEditingSkill(null);
    setSelectedSkillId(masterCatalog.length > 0 ? masterCatalog[0].id : '');
    setCustomSkillName('');
    setCustomSkillCategory('Programming');
    setProficiency('Intermediate');
    setRoleType('Both');
    setNotes('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (skill: StudentSkill) => {
    setEditingSkill(skill);
    setSelectedSkillId(skill.skill_id);
    setProficiency(skill.proficiency);
    setRoleType(skill.role_type);
    setNotes(skill.notes || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editingSkill) {
        await api.updateStudentSkill(user.id, editingSkill.id, {
          proficiency,
          role_type: roleType,
          notes,
        });
      } else {
        await api.addStudentSkill(user.id, {
          skill_id: selectedSkillId !== '' ? Number(selectedSkillId) : undefined,
          proficiency,
          role_type: roleType,
          notes,
          new_skill_name: selectedSkillId === '' ? customSkillName.trim() : undefined,
          new_skill_category: selectedSkillId === '' ? customSkillCategory : undefined,
        });
      }

      await loadSkills();
      await refreshUser();
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save skill.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (studentSkillId: number) => {
    if (!user) return;
    if (!confirm('Are you sure you want to remove this skill from your profile?')) return;
    try {
      await api.deleteStudentSkill(user.id, studentSkillId);
      await loadSkills();
      await refreshUser();
    } catch (err: any) {
      alert(err.message || 'Failed to remove skill.');
    }
  };

  // Filter skills
  const filteredSkills = skillsList.filter((s) => {
    if (selectedCategory !== 'All' && s.category !== selectedCategory) return false;
    if (selectedRole !== 'All' && s.role_type !== selectedRole && s.role_type !== 'Both') return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900">My Registered Skills</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Specify which skills you can teach to peer students and which skills you want to learn.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Skill</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
              selectedCategory === 'All'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Role:</span>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700 focus:outline-none"
          >
            <option value="All">All Roles</option>
            <option value="Teaching">Teaching Only</option>
            <option value="Learning">Learning Only</option>
            <option value="Both">Both (Teach & Learn)</option>
          </select>
        </div>
      </div>

      {/* Skills Grid */}
      {filteredSkills.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No skills found matching this filter</h3>
          <p className="text-xs text-slate-400 mt-1">
            Register skills you are passionate about to start teaching and learning with your peers.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Add Your First Skill
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((sk) => {
            const isTeaching = sk.role_type === 'Teaching' || sk.role_type === 'Both';
            const isLearning = sk.role_type === 'Learning' || sk.role_type === 'Both';

            return (
              <div
                key={sk.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {sk.category || 'General'}
                    </span>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleOpenEditModal(sk)}
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Skill"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(sk.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Remove Skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-700 transition">
                    {sk.skill_name}
                  </h3>

                  {sk.notes && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{sk.notes}</p>}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  {/* Proficiency Badge */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Proficiency:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sk.proficiency === 'Advanced'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sk.proficiency === 'Intermediate'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {sk.proficiency}
                    </span>
                  </div>

                  {/* Role Type Pill */}
                  <div className="flex items-center gap-1">
                    {isTeaching && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700">
                        Teaches
                      </span>
                    )}
                    {isLearning && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700">
                        Learns
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Skill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold">
                  {editingSkill ? 'Edit Registered Skill' : 'Register New Skill'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Skill Choice */}
              {!editingSkill && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Skill from Catalog *
                  </label>
                  <select
                    value={selectedSkillId}
                    onChange={(e) =>
                      setSelectedSkillId(e.target.value === 'custom' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {masterCatalog.map((catSkill) => (
                      <option key={catSkill.id} value={catSkill.id}>
                        {catSkill.name} ({catSkill.category})
                      </option>
                    ))}
                    <option value="custom">+ Suggest Other Custom Skill</option>
                  </select>

                  {selectedSkillId === '' && (
                    <div className="mt-3 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
                      <div>
                        <label className="block text-[11px] font-bold text-indigo-900 mb-1">
                          Custom Skill Name
                        </label>
                        <input
                          type="text"
                          required
                          value={customSkillName}
                          onChange={(e) => setCustomSkillName(e.target.value)}
                          placeholder="e.g. Flutter, Kotlin, Quantum Computing"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-indigo-900 mb-1">
                          Category
                        </label>
                        <select
                          value={customSkillCategory}
                          onChange={(e) => setCustomSkillCategory(e.target.value as SkillCategory)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                        >
                          {categories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Proficiency Level */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Proficiency Level *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Beginner', 'Intermediate', 'Advanced'] as ProficiencyLevel[]).map((level) => (
                    <button
                      type="button"
                      key={level}
                      onClick={() => setProficiency(level)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                        proficiency === level
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Role Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  What is your role for this skill? *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Teaching', 'Learning', 'Both'] as SkillRole[]).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRoleType(r)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                        roleType === r
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {r === 'Both' ? 'Both (Teach & Learn)' : r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Topic Notes or Sub-areas (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Can teach dynamic programming, tree traversals, and graphs."
                  className="w-full px-3.5 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingSkill ? 'Update Skill' : 'Add to Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
