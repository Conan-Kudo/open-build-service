module GetFlags
  # FIXME: All of this would not be needed if creating an Package/Project would create all
  #        the build, publish, debuginfo and useforbuild Flags. The only reason
  #        this happens here is because rendering the XML does ignore the defaults.
  # Returns a hash of arrays, sorted by repository.
  # The arrays contain Flag objects of type, sorted by architecture.
  # Like:
  # {all: [Flag, Flag-i586, Flag-x86_64], 13.2: [Flag, Flag-i585, Flag-x86_64]}
  def get_flags(flag_type)
    the_flags = {}

    # FIXME: A helper called in a model...
    return the_flags unless FlagHelper::TYPES.has_key?(flag_type.to_s)

    # [nil] is a placeholder for "all" repositories
    [nil].concat(self.repositories.map{|repo| repo.name}).each do |repository|
      the_flags[repository] = []
      # [nil] is a placeholder for "all" architectures
      [nil].concat(self.architectures.uniq).each do |architecture|
        architecture_id = architecture ? architecture.id : nil
        flag = self.flags.where(flag: flag_type).where(repo: repository).where(architecture_id: architecture_id).first
        # If there is no flag create a temporary one.
        unless flag
          flag = self.flags.new( flag: flag_type, repo: repository, architecture: architecture )
          flag.status = flag.default_status
        end
        the_flags[repository] << flag
      end
    end
    the_flags['all'] = the_flags.delete(nil)

    the_flags
  end
end
