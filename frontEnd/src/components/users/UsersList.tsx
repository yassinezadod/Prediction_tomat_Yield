import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Modal } from "../ui/modal";
import Label from "../form/Label";

import Badge from "../ui/badge/Badge";
import { User } from '../../types';
import { authService } from '../../services/authService';
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
// Import des images
import user1 from "/images/user/user (1).png";
import user2 from "/images/user/user (5).png";
import toast from "react-hot-toast";
import { useModal } from "../../hooks/useModal";

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
// Ajout pour l'édition
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isOpen, openModal, closeModal } = useModal();
  // Fonction pour récupérer tous les utilisateurs
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await authService.getAllUsers();
      console.log("📌 Utilisateurs récupérés:", data);
      setUsers(data);
      setError(null);
    } catch (err: any) {
      console.error("❌ Eror Loading users:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer un utilisateur

const handleDeleteUserAdminByEmail = async (email: string) => {
  // Show a confirmation toast instead of window.confirm
  const confirm = await new Promise<boolean>((resolve) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm">
          ⚠️ Are you sure you want to delete this user? <br />
          <strong>{email}</strong>
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              resolve(false);
            }}
            className="px-3 py-1 rounded bg-gray-200 text-gray-800 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              resolve(true);
            }}
            className="px-3 py-1 rounded bg-red-600 text-white text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: Infinity }); // stays until user clicks
  });

  if (!confirm) return;

  try {
    setDeleteLoading(email);

    const result = await authService.deleteUserAdminByEmail(email);

    // Optimistic update
    setUsers((prev) => prev.filter((u) => u.email !== email));

    toast.success(result.message || "User deleted successfully!");
  } catch (err: any) {
    toast.error(err.message || "Error while deleting the user.");
  } finally {
    setDeleteLoading(null);
  }
};


  // Fonction pour éditer un utilisateur (placeholder)
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      firstname: user.firstname || "",
      lastname: user.lastname || "",
      phone: user.phone || "",
      bio: user.bio || "",
    });
    openModal();
  };
   //  Gérer les changements des champs
  const handleInputChange = (field: keyof User, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
   //  Sauvegarder les modifications
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setIsSubmitting(true);
      const { message, user: updatedUser } = await authService.updateUserAdminByEmail(
        selectedUser.email,
        formData
      );

      //  Mise à jour de la liste localement
      setUsers((prev) =>
        prev.map((u) => (u.email === selectedUser.email ? { ...u, ...updatedUser } : u))
      );

      toast.success(message || "User updated successfully!");
      closeModal();
    } catch (err: any) {
      toast.error(err.message || "Error updating user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Charger les utilisateurs au montage du composant
  useEffect(() => {
    fetchUsers();
  }, []);

  // État de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  // État d'erreur (sans utilisateurs)
  if (error && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-500 text-lg font-semibold mb-2">Erreur de chargement</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={fetchUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
User Management          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {users.length} user{users.length > 1 ? 's' : ''} found{users.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            <svg
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            See all
          </button>

          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            Filter
          </button>
        </div>
      </div>

      {/* Affichage des erreurs */}
      {error && users.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Attention:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Liste vide */}
      {users.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Aucun utilisateur trouvé
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Il n'y a actuellement aucun utilisateur dans le système.
          </p>
        </div>
      )}

      {/* Tableau des utilisateurs */}
      {users.length > 0 && (
        <div className="max-w-full overflow-x-auto">
          <Table className="table-auto w-full">
            {/* En-tête du tableau */}
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                >
                  Users
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                >
                  Bio
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                >
                  Phone
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Corps du tableau */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  {/* Colonne Utilisateur */}
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <img
                          src={user.role === "admin" ? user2 : user1}
                          className="h-12 w-12 object-cover"
                          alt={user.name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = user.role === "admin" ? user2 : user1;
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm dark:text-white">
                          {user.name || 'Nom non défini'}
                        </p>
                        <div className="mt-1">
                          <Badge 
                            size="sm" 
                            color={user.role === "admin" ? "warning" : "success"}
                          >
                            {user.role === "admin" ? " Admin" : "Utilisateur"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Colonne Bio */}
                  <TableCell className="py-4 text-gray-600 text-sm dark:text-gray-400">
                    <div className="max-w-xs">
                      {user.bio ? (
                        <span className="line-clamp-2">{user.bio}</span>
                      ) : (
                        <span className="italic text-gray-400">Aucune bio</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Colonne Email */}
                  <TableCell className="py-4 text-gray-600 text-sm dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span className="font-mono text-xs">{user.email}</span>
                    </div>
                  </TableCell>

                  {/* Colonne Téléphone */}
                  <TableCell className="py-4 text-gray-600 text-sm dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <span className="font-mono text-xs">
                        {user.phone || 'Non défini'}
                      </span>
                    </div>
                  </TableCell>

                  {/* Colonne Actions */}
                  <TableCell className="py-4">
                    <div className="flex gap-2 justify-center">
                      {/* Bouton Éditer */}
                      <button
                        onClick={() => handleEditUser(user)}
                        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 hover:shadow-md transition-all duration-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        title={`Éditer ${user.name}`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>

                      {/* Bouton Supprimer */}
                      <button
                        onClick={() => handleDeleteUserAdminByEmail(user.email)}
                        disabled={deleteLoading === user.email}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium shadow-sm transition-all duration-200 ${
                          deleteLoading === user.email
                            ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 hover:shadow-md dark:border-red-600 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40'
                        }`}
                        title={`Supprimer ${user.name}`}
                      >
                        {deleteLoading === user.email ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle 
                              className="opacity-25" 
                              cx="12" 
                              cy="12" 
                              r="10" 
                              stroke="currentColor" 
                              strokeWidth="4"
                              fill="none"
                            />
                            <path 
                              className="opacity-75" 
                              fill="currentColor" 
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                        {deleteLoading === user.email ? 'Suppression...' : 'Delete'}
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

        </div>
      )}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          
          <form onSubmit={handleSave} className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900/50 dark:border-red-800 dark:text-red-300">
                  {error}
                </div>
              )}

              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>First Name</Label>
                    <Input 
                      type="text" 
                      value={formData.firstname} 
                      onChange={(e) => handleInputChange('firstname', e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Last Name</Label>
                    <Input 
                      type="text" 
                      value={formData.lastname}
                      onChange={(e) => handleInputChange('lastname', e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Phone</Label>
                    <Input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Bio</Label>
                    <Input 
                      type="text" 
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                    />
                  </div>

                  
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={closeModal}
                disabled={isSubmitting}
              >
                Close
              </Button>
              <Button 
                size="sm" 
                disabled={isSubmitting }
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
      
    </div>
  );
}