

import { supabase } from "@/integrations/supabase/client";

/**
 * Assigns a specific role to a user
 * @param userId The ID of the user to assign the role to
 * @param role The role to assign (fan, influencer, admin)
 * @returns An object containing success status and any error message
 */
export const assignRole = async (userId: string, role: 'fan' | 'influencer' | 'admin') => {
  try {
    // First check if the user already has this role
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', role)
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }

    // If the user already has the role, no need to insert
    if (existingRole) {
      return { success: true, message: `User already has the ${role} role.` };
    }

    // Insert the new role
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error assigning role:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Removes a specific role from a user
 * @param userId The ID of the user to remove the role from
 * @param role The role to remove
 * @returns An object containing success status and any error message
 */
export const removeRole = async (userId: string, role: 'fan' | 'influencer' | 'admin') => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error removing role:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Get all roles assigned to a user
 * @param userId The ID of the user
 * @returns An array of roles assigned to the user
 */
export const getUserRoles = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return { 
      success: true, 
      roles: data.map(item => item.role) 
    };
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      roles: [] 
    };
  }
};

/**
 * Check if a user has a specific role
 * @param userId The ID of the user to check
 * @param role The role to check for
 * @returns Boolean indicating if the user has the role
 */
export const hasRole = async (userId: string, role: 'fan' | 'influencer' | 'admin') => {
  const response = await getUserRoles(userId);
  if (!response.success) {
    return false;
  }
  return response.roles.includes(role);
};
