class ChangeRepositoriesRemoteProjectNameToNotNull < ActiveRecord::Migration[5.0]
  def up
    old = CONFIG['global_write_through']
    CONFIG['global_write_through'] = false

    execute 'UPDATE repositories SET remote_project_name = "" WHERE remote_project_name is null'

    change_column_null :repositories, :remote_project_name, false
    change_column_default :repositories, :remote_project_name, ''

    CONFIG['global_write_through'] = old
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
