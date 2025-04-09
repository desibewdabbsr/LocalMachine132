(.env) desibewda@pop-os:/mnt/development/pop-dev-assistant$ python -m pytest tests/unit -v --maxfail=5
================================= test session starts =================================
platform linux -- Python 3.12.9, pytest-6.2.5, py-1.11.0, pluggy-1.4.0 -- /mnt/development/pop-dev-assistant/.env/bin/python
cachedir: .pytest_cache
hypothesis profile 'brownie-verbose' -> verbosity=2, deadline=None, max_examples=50, stateful_step_count=10, report_multiple_bugs=False, database=DirectoryBasedExampleDatabase(PosixPath('/home/desibewda/.brownie/hypothesis'))
rootdir: /mnt/development/pop-dev-assistant, configfile: pytest.ini
plugins: mock-3.14.0, web3-6.15.1, anyio-4.9.0, eth-brownie-1.20.6, asyncio-0.18.3, forked-1.6.0, hypothesis-6.27.3, xdist-1.34.0, cov-6.0.0
asyncio: mode=Mode.AUTO
collected 101 items                                                                   
Attached to local RPC client listening at '127.0.0.1:8545'...

tests/unit/test_base_initializer.py::TestBaseInitializer::test_base_initializer_contract PASSED [  0%]
tests/unit/test_config_manager.py::test_config_manager_initialization PASSED    [  1%]
tests/unit/test_config_manager.py::test_default_config_creation PASSED          [  2%]
tests/unit/test_config_manager.py::test_save_and_load_config PASSED             [  3%]
tests/unit/test_config_manager.py::test_load_secrets PASSED                     [  4%]
tests/unit/test_config_manager.py::test_missing_secrets_file PASSED             [  5%]
tests/unit/test_config_manager.py::test_invalid_config_file PASSED              [  6%]
tests/unit/test_dependency_manager.py::test_dependency_initialization PASSED    [  7%]
tests/unit/test_dependency_manager.py::test_dependency_file_generation PASSED   [  8%]
tests/unit/test_dependency_manager.py::test_pyproject_toml_content PASSED       [  9%]
tests/unit/test_dependency_manager.py::test_web_project_dependencies PASSED     [ 10%]
tests/unit/test_dependency_manager.py::test_invalid_project_type PASSED         [ 11%]
tests/unit/test_file_operations.py::test_directory_creation PASSED              [ 12%]
tests/unit/test_file_operations.py::test_file_copy PASSED                       [ 13%]
tests/unit/test_file_operations.py::test_directory_copy PASSED                  [ 14%]
tests/unit/test_file_operations.py::test_safe_delete PASSED                     [ 15%]
tests/unit/test_file_operations.py::test_error_handling PASSED                  [ 16%]
tests/unit/test_initializer.py::test_project_initialization PASSED              [ 17%]
tests/unit/test_initializer.py::test_directory_structure_with_template PASSED   [ 18%]
tests/unit/test_initializer.py::test_git_initialization PASSED                  [ 19%]
tests/unit/test_initializer.py::test_error_handling PASSED                      [ 20%]
tests/unit/test_initializer.py::test_configuration_files PASSED                 [ 21%]
tests/unit/test_initializer.py::test_template_type_handling PASSED              [ 22%]
tests/unit/test_initializer.py::test_create_project PASSED                      [ 23%]
tests/unit/test_logger.py::test_singleton_instance PASSED                       [ 24%]
tests/unit/test_logger.py::test_logger_creation PASSED                          [ 25%]
tests/unit/test_logger.py::test_performance_monitoring PASSED                   [ 26%]
tests/unit/test_logger.py::test_error_logging PASSED                            [ 27%]
tests/unit/test_logger.py::test_multiple_loggers PASSED                         [ 28%]
tests/unit/test_logger.py::test_logger_setup PASSED                             [ 29%]
tests/unit/test_logger.py::test_logger_setup_custom_level PASSED                [ 30%]
tests/unit/test_logger.py::test_logger_setup_file_creation PASSED               [ 31%]
tests/unit/test_node_toolchain_manager.py::test_volta_setup PASSED              [ 32%]
tests/unit/test_performance_metrics.py::test_metrics_collection PASSED          [ 33%]
tests/unit/test_performance_metrics.py::test_alert_generation PASSED            [ 34%]
tests/unit/test_performance_metrics.py::test_metrics_with_alerts PASSED         [ 35%]
tests/unit/test_performance_metrics.py::test_alert_thresholds PASSED            [ 36%]
tests/unit/test_performance_metrics.py::test_alert_severity_levels PASSED       [ 37%]
tests/unit/test_rust_toolchain_manager.py::test_rust_environment PASSED         [ 38%]
tests/unit/test_rust_toolchain_manager.py::test_toolchain_configuration PASSED  [ 39%]
tests/unit/test_rust_toolchain_manager.py::test_component_installation PASSED   [ 40%]
tests/unit/test_rust_toolchain_manager.py::test_project_structure PASSED        [ 41%]
tests/unit/test_rust_toolchain_manager.py::test_build_configuration PASSED      [ 42%]
tests/unit/test_rust_toolchain_manager.py::test_setup_verification PASSED       [ 43%]
tests/unit/test_rust_toolchain_manager.py::test_complete_setup PASSED           [ 44%]
tests/unit/test_rust_toolchain_manager.py::test_toolchain_update PASSED         [ 45%]
tests/unit/test_rust_toolchain_manager.py::test_error_handling PASSED           [ 46%]
tests/unit/test_secrets_handler.py::test_encryption_key_generation PASSED       [ 47%]
tests/unit/test_secrets_handler.py::test_gitignore_update PASSED                [ 48%]
tests/unit/test_secrets_handler.py::test_validation_error PASSED                [ 49%]
tests/unit/test_secrets_handler.py::test_secrets_initialization PASSED          [ 50%]
tests/unit/test_secrets_handler.py::test_secrets_file_creation PASSED           [ 51%]
tests/unit/test_system_dependency_manager.py::test_package_manager_detection PASSED [ 52%]
tests/unit/test_system_dependency_manager.py::test_specific_package_managers[/usr/bin/apt-apt] PASSED [ 53%]
tests/unit/test_system_dependency_manager.py::test_specific_package_managers[/usr/bin/apt-get-apt] PASSED [ 54%]
tests/unit/test_system_dependency_manager.py::test_specific_package_managers[/usr/bin/pop-upgrade-apt] PASSED [ 55%]
tests/unit/test_system_dependency_manager.py::test_dependency_installation PASSED [ 56%]
tests/unit/test_system_dependency_manager.py::test_individual_dependency_install PASSED [ 57%]
tests/unit/test_system_dependency_manager.py::test_version_detection PASSED     [ 58%]
tests/unit/test_system_dependency_manager.py::test_dependency_verification PASSED [ 59%]
tests/unit/test_system_dependency_manager.py::test_dependency_cleanup PASSED    [ 60%]
tests/unit/test_system_dependency_manager.py::test_error_handling PASSED        [ 61%]
tests/unit/test_system_dependency_manager.py::test_system_specific_commands PASSED [ 62%]
tests/unit/test_system_dependency_manager.py::test_bulk_installation PASSED     [ 63%]
tests/unit/test_template_manager.py::test_get_default_template_without_config PASSED [ 64%]
tests/unit/test_template_manager.py::test_get_default_template_with_config PASSED [ 65%]
tests/unit/test_template_manager.py::test_fallback_template PASSED              [ 66%]
tests/unit/test_template_manager.py::test_template_structure_validity PASSED    [ 67%]
tests/unit/test_template_manager.py::test_required_template_keys[contracts] PASSED [ 68%]
tests/unit/test_template_manager.py::test_required_template_keys[test] PASSED   [ 69%]
tests/unit/test_template_manager.py::test_required_template_keys[scripts] PASSED [ 70%]
tests/unit/test_template_manager.py::test_required_template_keys[config] PASSED [ 71%]
tests/unit/test_template_manager.py::test_templates_dir_exists PASSED           [ 72%]
tests/unit/test_template_manager.py::test_config_path_exists PASSED             [ 73%]
tests/unit/test_toolchain_orchestrator.py::test_requirements_validation PASSED  [ 74%]
tests/unit/test_toolchain_orchestrator.py::test_invalid_requirements PASSED     [ 75%]
tests/unit/test_toolchain_orchestrator.py::test_base_dependencies_setup PASSED  [ 76%]
tests/unit/test_toolchain_orchestrator.py::test_language_toolchain_setup PASSED [ 77%]
tests/unit/test_toolchain_orchestrator.py::test_cross_language_integration PASSED [ 78%]
tests/unit/test_toolchain_orchestrator.py::test_build_configuration PASSED      [ 79%]
tests/unit/test_toolchain_orchestrator.py::test_test_integration PASSED         [ 80%]
tests/unit/test_toolchain_orchestrator.py::test_workspace_configuration PASSED  [ 81%]
tests/unit/test_toolchain_orchestrator.py::test_verification_process PASSED     [ 82%]
tests/unit/test_toolchain_orchestrator.py::test_cleanup_functionality PASSED    [ 83%]
tests/unit/test_toolchain_orchestrator.py::test_complete_setup_workflow PASSED  [ 84%]
tests/unit/test_toolchain_setup.py::test_rustup_verification PASSED             [ 85%]
tests/unit/test_toolchain_setup.py::test_component_installation PASSED          [ 86%]
tests/unit/test_toolchain_setup.py::test_toolchain_configuration PASSED         [ 87%]
tests/unit/test_toolchain_setup.py::test_rust_analyzer_setup PASSED             [ 88%]
tests/unit/test_toolchain_setup.py::test_additional_tools PASSED                [ 89%]
tests/unit/test_toolchain_setup.py::test_complete_setup PASSED                  [ 90%]
tests/unit/test_web3_mock.py::test_mock_web3_initialization PASSED              [ 91%]
tests/unit/test_web3_mock.py::test_mock_provider PASSED                         [ 92%]
tests/unit/test_web3_mock.py::test_web3_connection PASSED                       [ 93%]
tests/unit/test_web3_mock.py::test_http_provider_creation PASSED                [ 94%]
tests/unit/test_web3_mock.py::test_middleware_onion PASSED                      [ 95%]
tests/unit/test_web3_mock.py::test_mock_eth_module PASSED                       [ 96%]
tests/unit/test_web3_mock.py::test_eth_module_block_operations PASSED           [ 97%]
tests/unit/test_workflow_components.py::test_toolchain_ai_integration PASSED    [ 98%]
tests/unit/test_workflow_components.py::test_workflow_error_handling PASSED     [ 99%]
tests/unit/test_workflow_components.py::test_workflow_performance PASSED        [100%]

================================== warnings summary ===================================
.env/lib/python3.12/site-packages/_pytest/config/__init__.py:1233
  /mnt/development/pop-dev-assistant/.env/lib/python3.12/site-packages/_pytest/config/__init__.py:1233: PytestConfigWarning: Unknown config option: asyncio_default_fixture_loop_scope
  
    self._warn_or_fail_if_strict(f"Unknown config option: {key}\n")

tests/unit/test_workflow_components.py::test_toolchain_ai_integration
  /mnt/development/pop-dev-assistant/.env/lib/python3.12/site-packages/pluggy/_callers.py:102: RuntimeWarning: coroutine 'CodyAPIClient.analyze_code' was never awaited
    res = hook_impl.function(*args)

-- Docs: https://docs.pytest.org/en/stable/warnings.html
===================== 101 passed, 2 warnings in 341.51s (0:05:41) =====================
(.env) desibewda@pop-os:/mnt/development/pop-dev-assistant$ 








.env) desibewda@pop-os:/mnt/development/pop-dev-assistant$ python -m pytest tests/integration -v --maxfail=5
================================= test session starts =================================
platform linux -- Python 3.12.9, pytest-6.2.5, py-1.11.0, pluggy-1.4.0 -- /mnt/development/pop-dev-assistant/.env/bin/python
cachedir: .pytest_cache
hypothesis profile 'brownie-verbose' -> verbosity=2, deadline=None, max_examples=50, stateful_step_count=10, report_multiple_bugs=False, database=DirectoryBasedExampleDatabase(PosixPath('/home/desibewda/.brownie/hypothesis'))
rootdir: /mnt/development/pop-dev-assistant, configfile: pytest.ini
plugins: mock-3.14.0, web3-6.15.1, anyio-4.9.0, eth-brownie-1.20.6, asyncio-0.18.3, forked-1.6.0, hypothesis-6.27.3, xdist-1.34.0, cov-6.0.0
asyncio: mode=Mode.AUTO
collected 175 items                                                                   
Attached to local RPC client listening at '127.0.0.1:8545'...

tests/integration/test_ai_orchestrator.py::test_project_analysis PASSED         [  0%]
tests/integration/test_ai_orchestrator.py::test_ml_model_integration PASSED     [  1%]
tests/integration/test_api_client.py::test_code_analysis PASSED                 [  1%]
tests/integration/test_api_client.py::test_api_error_handling PASSED            [  2%]
tests/integration/test_api_client.py::test_invalid_file PASSED                  [  2%]
tests/integration/test_api_client.py::test_directory_analysis PASSED            [  3%]
tests/integration/test_api_client.py::test_cody_api_connection PASSED           [  4%]
tests/integration/test_api_client.py::test_complete_code_analysis PASSED        [  4%]
tests/integration/test_api_client.py::test_code_analysis_basic PASSED           [  5%]
tests/integration/test_api_client.py::test_send_request PASSED                  [  5%]
tests/integration/test_api_client.py::test_language_detection PASSED            [  6%]
tests/integration/test_api_client.py::test_api_call PASSED                      [  6%]
tests/integration/test_command_processor.py::TestCommandProcessor::test_process_command PASSED [  7%]
tests/integration/test_command_processor.py::TestCommandProcessor::test_process_defi_analysis_command PASSED [  8%]
tests/integration/test_command_processor.py::TestCommandProcessor::test_error_handling PASSED [  8%]
tests/integration/test_command_processor.py::TestCommandProcessor::test_determine_command_type PASSED [  9%]
tests/integration/test_command_processor.py::TestCommandProcessor::test_process_service_command PASSED [  9%]
tests/integration/test_contract_optimizer.py::test_contract_optimization PASSED [ 10%]
tests/integration/test_contract_verifier.py::test_contract_verification PASSED  [ 10%]
tests/integration/test_dynamic_contract_gen.py::test_generate_basic_contract PASSED [ 11%]
tests/integration/test_dynamic_contract_gen.py::test_generate_erc20_contract PASSED [ 12%]
tests/integration/test_dynamic_contract_gen.py::test_generate_defi_contract PASSED [ 12%]
tests/integration/test_dynamic_contract_gen.py::test_generate_contract_with_empty_features PASSED [ 13%]
tests/integration/test_dynamic_contract_gen.py::test_generate_contract_with_special_characters PASSED [ 13%]
tests/integration/test_dynamic_contract_gen.py::test_generate_contract_validates_input PASSED [ 14%]
tests/integration/test_dynamic_contract_gen.py::test_generate_contract_with_multiple_features PASSED [ 14%]
tests/integration/test_dynamic_contract_gen.py::test_generate_contract_maintains_solidity_syntax PASSED [ 15%]
tests/integration/test_dynamic_contract_gen.py::test_generate_contract_includes_license PASSED [ 16%]
tests/integration/test_dynamic_contract_gen.py::test_generate_contract_with_inheritance PASSED [ 16%]
tests/integration/test_full_workflow.py::test_complete_development_workflow PASSED [ 17%]
tests/integration/test_full_workflow.py::test_workflow_error_handling PASSED    [ 17%]
tests/integration/test_full_workflow.py::test_workflow_performance PASSED       [ 18%]
tests/integration/test_hardhat_compilation.py::test_compile_valid_project PASSED [ 18%]
tests/integration/test_hardhat_compilation.py::test_compile_invalid_project PASSED [ 19%]
tests/integration/test_hardhat_compilation.py::test_compile_with_contracts PASSED [ 20%]
tests/integration/test_hardhat_config.py::test_config_creation PASSED           [ 20%]
tests/integration/test_hardhat_config.py::test_config_validation PASSED         [ 21%]
tests/integration/test_hardhat_dependencies.py::test_dependency_installation PASSED [ 21%]
tests/integration/test_hardhat_dependencies.py::test_handles_invalid_path PASSED [ 22%]
tests/integration/test_hardhat_dependencies.py::test_dependency_versions PASSED [ 22%]
tests/integration/test_hardhat_project_manager.py::test_project_creation PASSED [ 23%]
tests/integration/test_hardhat_project_manager.py::test_contract_addition PASSED [ 24%]
tests/integration/test_hardhat_runner_compiler.py::test_test_execution PASSED   [ 24%]
tests/integration/test_hardhat_runner_compiler.py::test_project_compilation PASSED [ 25%]
tests/integration/test_hardhat_setup.py::test_complete_initialization PASSED    [ 25%]
tests/integration/test_hardhat_setup.py::test_local_network_connection PASSED   [ 26%]
tests/integration/test_hardhat_setup.py::test_cleanup_on_failure PASSED         [ 26%]
tests/integration/test_hardhat_setup.py::test_test_execution PASSED             [ 27%]
tests/integration/test_hardhat_setup.py::test_project_compilation PASSED        [ 28%]
tests/integration/test_hardhat_test_runner.py::test_basic_test_execution PASSED [ 28%]
tests/integration/test_hardhat_test_runner.py::test_coverage_reporting PASSED   [ 29%]
tests/integration/test_ml_decision_engine.py::test_project_analysis PASSED      [ 29%]
tests/integration/test_ml_decision_engine.py::test_contract_optimization PASSED [ 30%]
tests/integration/test_ml_decision_engine.py::test_code_pattern_analysis PASSED [ 30%]
tests/integration/test_ml_decision_engine.py::test_optimization_generation PASSED [ 31%]
tests/integration/test_ml_decision_engine.py::test_requirement_analysis PASSED  [ 32%]
tests/integration/test_ml_decision_engine.py::test_tech_stack_determination PASSED [ 32%]
tests/integration/test_ml_decision_engine.py::test_security_analysis PASSED     [ 33%]
tests/integration/test_ml_decision_engine.py::test_invalid_command_handling PASSED [ 33%]
tests/integration/test_ml_decision_engine.py::test_model_initialization PASSED  [ 34%]
tests/integration/test_ml_decision_engine.py::test_default_config_loading PASSED [ 34%]
tests/integration/test_ml_decision_engine.py::test_model_configuration PASSED   [ 35%]
tests/integration/test_ml_decision_engine.py::test_model_configuration_defaults PASSED [ 36%]
tests/integration/test_ml_security_analyzer.py::test_contract_security_analysis PASSED [ 36%]
tests/integration/test_ml_security_analyzer.py::test_security_improvements PASSED [ 37%]
tests/integration/test_ml_security_analyzer.py::test_high_risk_contract_analysis PASSED [ 37%]
tests/integration/test_ml_security_analyzer.py::test_secure_contract_analysis PASSED [ 38%]
tests/integration/test_ml_security_analyzer.py::test_improvement_priorities PASSED [ 38%]
tests/integration/test_ml_security_analyzer.py::test_comprehensive_analysis PASSED [ 39%]
tests/integration/test_ml_security_analyzer.py::test_vulnerability_detection PASSED [ 40%]
tests/integration/test_model_trainer.py::test_model_initialization PASSED       [ 40%]
tests/integration/test_model_trainer.py::test_training_execution PASSED         [ 41%]
tests/integration/test_model_trainer.py::test_contract_generation PASSED        [ 41%]
tests/integration/test_model_trainer.py::test_security_pattern_generation PASSED [ 42%]
tests/integration/test_model_trainer.py::test_optimization_generation PASSED    [ 42%]
tests/integration/test_model_trainer.py::test_security_enhancement PASSED       [ 43%]
tests/integration/test_model_trainer.py::test_feature_optimization PASSED       [ 44%]
tests/integration/test_model_trainer.py::test_ml_model_execution PASSED         [ 44%]
tests/integration/test_model_trainer.py::test_training_environment_setup PASSED [ 45%]
tests/integration/test_model_trainer.py::test_metrics_collection PASSED         [ 45%]
tests/integration/test_performance_metrics_monitoring.py::test_long_running_monitoring PASSED [ 46%]
tests/integration/test_performance_metrics_monitoring.py::test_concurrent_monitoring PASSED [ 46%]
tests/integration/test_performance_metrics_monitoring.py::test_metrics_aggregation PASSED [ 47%]
tests/integration/test_performance_metrics_monitoring.py::test_resource_intensive_monitoring PASSED [ 48%]
tests/integration/test_performance_metrics_monitoring.py::test_error_recovery_monitoring PASSED [ 48%]
tests/integration/test_processor.py::TestBaseProcessor::test_base_process_command PASSED [ 49%]
tests/integration/test_requirement_analyzer.py::test_comprehensive_analysis PASSED [ 49%]
tests/integration/test_requirement_analyzer.py::test_feature_extraction PASSED  [ 50%]
tests/integration/test_requirement_analyzer.py::test_architecture_planning PASSED [ 50%]
tests/integration/test_requirement_analyzer.py::test_security_assessment PASSED [ 51%]
tests/integration/test_requirement_analyzer.py::test_performance_analysis PASSED [ 52%]
tests/integration/test_requirement_analyzer.py::test_integration_requirements PASSED [ 52%]
tests/integration/test_requirement_analyzer.py::test_testing_strategy PASSED    [ 53%]
tests/integration/test_requirement_analyzer.py::test_invalid_input_handling PASSED [ 53%]
tests/integration/test_requirement_analyzer.py::test_complex_project_analysis PASSED [ 54%]
tests/integration/test_rust_toolchain_integration.py::test_complete_toolchain_workflow PASSED [ 54%]
tests/integration/test_rust_toolchain_integration.py::test_performance_metrics PASSED [ 55%]
tests/integration/test_rust_toolchain_integration.py::test_dependency_integration PASSED [ 56%]
tests/integration/test_rust_toolchain_integration.py::test_error_recovery PASSED [ 56%]
tests/integration/test_security_checker.py::test_security_analysis PASSED       [ 57%]
tests/integration/test_security_checker.py::test_vulnerability_scanning PASSED  [ 57%]
tests/integration/test_security_checker.py::test_access_control_check PASSED    [ 58%]
tests/integration/test_security_checker.py::test_function_analysis PASSED       [ 58%]
tests/integration/test_security_checker.py::test_dependency_check PASSED        [ 59%]
tests/integration/test_system_dependency_integration.py::test_complete_dependency_workflow PASSED [ 60%]
tests/integration/test_system_dependency_integration.py::test_toolchain_integration PASSED [ 60%]
tests/integration/test_system_dependency_integration.py::test_performance_monitoring PASSED [ 61%]
tests/integration/test_system_dependency_integration.py::test_error_recovery PASSED [ 61%]
tests/integration/test_toolchain_orchestrator_integration.py::test_complete_toolchain_workflow PASSED [ 62%]
tests/integration/test_toolchain_orchestrator_integration.py::test_toolchain_error_handling PASSED [ 62%]
tests/integration/test_toolchain_orchestrator_integration.py::test_toolchain_performance_mock PASSED [ 63%]
tests/integration/test_workflow_components_integration.py::test_integrated_workflow PASSED [ 64%]
tests/integration/test_workflow_components_integration.py::test_component_interaction_performance PASSED [ 64%]
tests/integration/test_workflow_components_integration.py::test_error_propagation PASSED [ 65%]
tests/integration/cody/test_code_generator.py::TestCodeGenerator::test_erc20_generation PASSED [ 65%]
tests/integration/cody/test_code_generator.py::TestCodeGenerator::test_defi_protocol_generation PASSED [ 66%]
tests/integration/cody/test_code_generator.py::TestCodeGenerator::test_staking_contract_generation PASSED [ 66%]
tests/integration/cody/test_code_generator.py::TestCodeGenerator::test_spec_validation PASSED [ 67%]
tests/integration/cody/test_code_generator.py::TestCodeGenerator::test_metrics_calculation PASSED [ 68%]
tests/integration/cody/test_code_generator.py::TestCodeGenerator::test_generation_history PASSED [ 68%]
tests/integration/llama/test_config.py::test_llama_config_initialization PASSED [ 69%]
tests/integration/llama/test_config.py::test_llama_config_brain_path PASSED     [ 69%]
tests/integration/llama/test_config.py::test_llama_config_model_settings PASSED [ 70%]
tests/integration/llama/test_controller.py::TestLlamaController::test_template_type_determination PASSED [ 70%]
tests/integration/llama/test_controller.py::TestLlamaController::test_process_request_basic PASSED [ 71%]
tests/integration/llama/test_controller.py::TestLlamaController::test_context_aware_processing PASSED [ 72%]
tests/integration/llama/test_controller.py::TestLlamaController::test_interaction_history PASSED [ 72%]
tests/integration/llama/test_controller.py::TestLlamaController::test_template_analytics PASSED [ 73%]
tests/integration/llama/test_controller.py::TestLlamaController::test_error_handling PASSED [ 73%]
tests/integration/llama/test_controller.py::TestLlamaController::test_memory_management PASSED [ 74%]
tests/integration/llama/test_controller.py::TestLlamaController::test_service_management PASSED [ 74%]
tests/integration/llama/test_controller.py::TestLlamaController::test_command_processor_integration PASSED [ 75%]
tests/integration/llama/test_controller.py::TestLlamaController::test_track_performance PASSED [ 76%]
tests/integration/llama/test_controller.py::TestLlamaController::test_model_fallback PASSED [ 76%]
tests/integration/llama/test_controller.py::TestLlamaController::test_service_registration PASSED [ 77%]
tests/integration/llama/test_implementations.py::TestImplementations::test_memory_manager_operations PASSED [ 77%]
tests/integration/llama/test_implementations.py::TestImplementations::test_prompt_engine_processing PASSED [ 78%]
tests/integration/llama/test_implementations.py::TestImplementations::test_response_handler_processing PASSED [ 78%]
tests/integration/llama/test_implementations.py::TestImplementations::test_performance_manager_tracking PASSED [ 79%]
tests/integration/llama/test_memory_manager.py::TestMemoryManager::test_initialization PASSED [ 80%]
tests/integration/llama/test_memory_manager.py::TestMemoryManager::test_store_interaction PASSED [ 80%]
tests/integration/llama/test_memory_manager.py::TestMemoryManager::test_update_learning PASSED [ 81%]
tests/integration/llama/test_memory_manager.py::TestMemoryManager::test_get_interaction_history PASSED [ 81%]
tests/integration/llama/test_memory_manager.py::TestMemoryManager::test_get_learning_data PASSED [ 82%]
tests/integration/llama/test_memory_manager.py::TestMemoryManager::test_clear_memory PASSED [ 82%]
tests/integration/llama/test_memory_manager.py::TestMemoryManager::test_interaction_type_determination PASSED [ 83%]
tests/integration/llama/test_memory_manager.py::TestMemoryManager::test_analytics_update PASSED [ 84%]
tests/integration/llama/test_memory_manager.py::TestMemoryManager::test_memory_management_by_size PASSED [ 84%]
tests/integration/llama/test_prompt_engine.py::TestPromptEngine::test_basic_prompt_generation PASSED [ 85%]
tests/integration/llama/test_prompt_engine.py::TestPromptEngine::test_context_enhancement PASSED [ 85%]
tests/integration/llama/test_prompt_engine.py::TestPromptEngine::test_template_creation PASSED [ 86%]
tests/integration/llama/test_prompt_engine.py::TestPromptEngine::test_template_content_generation PASSED [ 86%]
tests/integration/llama/test_prompt_engine.py::TestPromptEngine::test_context_history PASSED [ 87%]
tests/integration/llama/test_prompt_engine.py::TestPromptEngine::test_prompt_truncation PASSED [ 88%]
tests/integration/llama/test_prompt_engine.py::TestPromptEngine::test_relevant_history_selection PASSED [ 88%]
tests/integration/llama/test_prompt_engine.py::TestPromptEngine::test_error_handling PASSED [ 89%]
tests/integration/llama/test_prompt_engine.py::TestPromptEngine::test_template_reuse PASSED [ 89%]
tests/integration/llama/test_prompt_engine.py::TestPromptEngine::test_context_history_limit PASSED [ 90%]
tests/integration/llama/test_response_handler.py::TestResponseHandler::test_basic_response_processing PASSED [ 90%]
tests/integration/llama/test_response_handler.py::TestResponseHandler::test_code_block_extraction PASSED [ 91%]
tests/integration/llama/test_response_handler.py::TestResponseHandler::test_response_cleaning PASSED [ 92%]
tests/integration/llama/test_response_handler.py::TestResponseHandler::test_metrics_calculation PASSED [ 92%]
tests/integration/llama/test_response_handler.py::TestResponseHandler::test_context_aware_processing PASSED [ 93%]
tests/integration/llama/test_response_handler.py::TestResponseHandler::test_metrics_summary PASSED [ 93%]
tests/integration/llama/test_response_handler.py::TestResponseHandler::test_error_handling PASSED [ 94%]
tests/integration/llama/test_response_handler.py::TestResponseHandler::test_history_limit PASSED [ 94%]
tests/integration/llama/test_response_handler.py::TestResponseHandler::test_confidence_calculation PASSED [ 95%]
tests/integration/llama/test_template_manager.py::TestTemplateManager::test_initialization PASSED [ 96%]
tests/integration/llama/test_template_manager.py::TestTemplateManager::test_template_loading_and_caching PASSED [ 96%]
tests/integration/llama/test_template_manager.py::TestTemplateManager::test_template_creation PASSED [ 97%]
tests/integration/llama/test_template_manager.py::TestTemplateManager::test_usage_statistics PASSED [ 97%]
tests/integration/llama/test_template_manager.py::TestTemplateManager::test_template_history PASSED [ 98%]
tests/integration/llama/test_template_manager.py::TestTemplateManager::test_similarity_matching PASSED [ 98%]
tests/integration/llama/test_template_manager.py::TestTemplateManager::test_different_categories PASSED [ 99%]
tests/integration/llama/test_template_manager.py::TestTemplateManager::test_description_standardization PASSED [100%]

================================== warnings summary ===================================
.env/lib/python3.12/site-packages/_pytest/config/__init__.py:1233
  /mnt/development/pop-dev-assistant/.env/lib/python3.12/site-packages/_pytest/config/__init__.py:1233: PytestConfigWarning: Unknown config option: asyncio_default_fixture_loop_scope
  
    self._warn_or_fail_if_strict(f"Unknown config option: {key}\n")

tests/integration/test_ai_orchestrator.py::test_project_analysis
tests/integration/test_ai_orchestrator.py::test_ml_model_integration
  /mnt/development/pop-dev-assistant/.env/lib/python3.12/site-packages/_pytest/python.py:183: RuntimeWarning: coroutine 'CodyAPIClient.analyze_code' was never awaited
    result = testfunction(**testargs)

tests/integration/test_command_processor.py::TestCommandProcessor::test_determine_command_type
  core_backend/tests/integration/test_command_processor.py:77: PytestWarning: The test <Function test_determine_command_type> is marked with '@pytest.mark.asyncio' but it is not an async function. Please remove asyncio marker. If the test is not marked explicitly, check for global markers applied via 'pytestmark'.

tests/integration/test_workflow_components_integration.py::test_integrated_workflow
  /mnt/development/pop-dev-assistant/.env/lib/python3.12/site-packages/pluggy/_callers.py:102: RuntimeWarning: coroutine 'CodyAPIClient.analyze_code' was never awaited
    res = hook_impl.function(*args)

tests/integration/test_workflow_components_integration.py::test_component_interaction_performance
  /mnt/development/pop-dev-assistant/core_backend/tests/integration/test_workflow_components_integration.py:214: RuntimeWarning: coroutine 'CodyAPIClient.analyze_code' was never awaited

tests/integration/test_workflow_components_integration.py::test_component_interaction_performance
  /mnt/development/pop-dev-assistant/core_backend/tests/integration/test_workflow_components_integration.py:232: RuntimeWarning: coroutine 'CodyAPIClient.analyze_code' was never awaited

tests/integration/test_workflow_components_integration.py::test_error_propagation
  /mnt/development/pop-dev-assistant/core_backend/tests/integration/test_workflow_components_integration.py:239: RuntimeWarning: coroutine 'CodyAPIClient.analyze_code' was never awaited

tests/integration/llama/test_prompt_engine.py::TestPromptEngine::test_prompt_truncation
  /mnt/development/pop-dev-assistant/core/ai_integration/llama/prompt_engine.py:122: DeprecationWarning: The 'warn' method is deprecated, use 'warning' instead
    self.logger.warn("Prompt exceeds context window, truncating...")

-- Docs: https://docs.pytest.org/en/stable/warnings.html
===================== 175 passed, 9 warnings in 556.79s (0:09:16) =====================
(.env) desibewda@pop-os:/mnt/development/pop-dev-assistant$ 






(.env) desibewda@pop-os:/mnt/development/pop-dev-assistant$ python -m pytest tests/functional -v --maxfail=5
================================= test session starts =================================
platform linux -- Python 3.12.9, pytest-6.2.5, py-1.11.0, pluggy-1.4.0 -- /mnt/development/pop-dev-assistant/.env/bin/python
cachedir: .pytest_cache
hypothesis profile 'brownie-verbose' -> verbosity=2, deadline=None, max_examples=50, stateful_step_count=10, report_multiple_bugs=False, database=DirectoryBasedExampleDatabase(PosixPath('/home/desibewda/.brownie/hypothesis'))
rootdir: /mnt/development/pop-dev-assistant, configfile: pytest.ini
plugins: mock-3.14.0, web3-6.15.1, anyio-4.9.0, eth-brownie-1.20.6, asyncio-0.18.3, forked-1.6.0, hypothesis-6.27.3, xdist-1.34.0, cov-6.0.0
asyncio: mode=Mode.AUTO
collected 60 items                                                                    
Attached to local RPC client listening at '127.0.0.1:8545'...

tests/functional/test_cargo_manager.py::test_rust_environment PASSED            [  1%]
tests/functional/test_cargo_manager.py::test_project_initialization PASSED      [  3%]
tests/functional/test_cargo_manager.py::test_dependency_configuration PASSED    [  5%]
tests/functional/test_cargo_manager.py::test_workspace_setup PASSED             [  6%]
tests/functional/test_cargo_manager.py::test_test_environment PASSED            [  8%]
tests/functional/test_cargo_manager.py::test_build_configuration PASSED         [ 10%]
tests/functional/test_component_manager.py::test_component_creation PASSED      [ 11%]
tests/functional/test_component_manager.py::test_component_file_content PASSED  [ 13%]
tests/functional/test_component_manager.py::test_styles_creation PASSED         [ 15%]
tests/functional/test_component_manager.py::test_test_file_creation PASSED      [ 16%]
tests/functional/test_component_manager.py::test_error_handling PASSED          [ 18%]
tests/functional/test_contract_manager.py::test_contract_compilation PASSED     [ 20%]
tests/functional/test_contract_manager.py::test_contract_deployment PASSED      [ 21%]
tests/functional/test_defi_analyzer.py::test_contract_analysis PASSED           [ 23%]
tests/functional/test_defi_analyzer.py::test_security_audit PASSED              [ 25%]
tests/functional/test_defi_analyzer.py::test_gas_analysis PASSED                [ 26%]
tests/functional/test_defi_analyzer.py::test_token_compliance PASSED            [ 28%]
tests/functional/test_defi_analyzer.py::test_risk_assessment PASSED             [ 30%]
tests/functional/test_env_setup.py::test_environment_creation PASSED            [ 31%]
tests/functional/test_env_setup.py::test_base_packages_installation PASSED      [ 33%]
tests/functional/test_env_setup.py::test_git_hooks_setup PASSED                 [ 35%]
tests/functional/test_env_setup.py::test_vscode_configuration PASSED            [ 36%]
tests/functional/test_env_setup.py::test_error_handling PASSED                  [ 38%]
tests/functional/test_node_setup.py::test_node_verification PASSED              [ 40%]
tests/functional/test_node_setup.py::test_typescript_setup PASSED               [ 41%]
tests/functional/test_node_setup.py::test_environment_vars PASSED               [ 43%]
tests/functional/test_node_setup.py::test_vscode_integration PASSED             [ 45%]
tests/functional/test_node_setup.py::test_complete_setup PASSED                 [ 46%]
tests/functional/test_node_setup.py::test_error_handling PASSED                 [ 48%]
tests/functional/test_node_setup.py::test_volta_configuration PASSED            [ 50%]
tests/functional/test_npm_manager.py::test_npm_environment PASSED               [ 51%]
tests/functional/test_npm_manager.py::test_package_json_creation PASSED         [ 53%]
tests/functional/test_npm_manager.py::test_dependency_installation PASSED       [ 55%]
tests/functional/test_npm_manager.py::test_dev_tools_setup PASSED               [ 56%]
tests/functional/test_npm_manager.py::test_scripts_configuration PASSED         [ 58%]
tests/functional/test_npm_manager.py::test_linting_setup PASSED                 [ 60%]
tests/functional/test_npm_manager.py::test_complete_initialization PASSED       [ 61%]
tests/functional/test_pip_handler.py::test_package_installation PASSED          [ 63%]
tests/functional/test_pip_handler.py::test_requirements_generation PASSED       [ 65%]
tests/functional/test_pip_handler.py::test_outdated_packages PASSED             [ 66%]
tests/functional/test_pip_handler.py::test_package_upgrade PASSED               [ 68%]
tests/functional/test_pip_handler.py::test_error_handling PASSED                [ 70%]
tests/functional/test_project_creation.py::test_complete_project_creation PASSED [ 71%]
tests/functional/test_project_creation.py::test_project_validation PASSED       [ 73%]
tests/functional/test_project_creation.py::test_cleanup PASSED                  [ 75%]
tests/functional/test_react_setup.py::test_react_app_creation PASSED            [ 76%]
tests/functional/test_react_setup.py::test_dependency_installation PASSED       [ 78%]
tests/functional/test_react_setup.py::test_testing_setup PASSED                 [ 80%]
tests/functional/test_react_setup.py::test_build_configuration PASSED           [ 81%]
tests/functional/test_react_setup.py::test_state_management_setup PASSED        [ 83%]
tests/functional/test_react_setup.py::test_dev_tools_setup PASSED               [ 85%]
tests/functional/test_react_setup.py::test_complete_initialization PASSED       [ 86%]
tests/functional/test_smart_contract_workflow.py::test_complete_contract_workflow PASSED [ 88%]
tests/functional/test_smart_contract_workflow.py::test_contract_modifications PASSED [ 90%]
tests/functional/test_smart_contract_workflow.py::test_deployment_configurations PASSED [ 91%]
tests/functional/test_venv_manager.py::test_venv_creation PASSED                [ 93%]
tests/functional/test_venv_manager.py::test_pip_upgrade PASSED                  [ 95%]
tests/functional/test_venv_manager.py::test_base_packages_installation PASSED   [ 96%]
tests/functional/test_venv_manager.py::test_vscode_configuration PASSED         [ 98%]
tests/functional/test_venv_manager.py::test_env_file_creation PASSED            [100%]

================================== warnings summary ===================================
.env/lib/python3.12/site-packages/_pytest/config/__init__.py:1233
  /mnt/development/pop-dev-assistant/.env/lib/python3.12/site-packages/_pytest/config/__init__.py:1233: PytestConfigWarning: Unknown config option: asyncio_default_fixture_loop_scope
  
    self._warn_or_fail_if_strict(f"Unknown config option: {key}\n")

-- Docs: https://docs.pytest.org/en/stable/warnings.html
===================== 60 passed, 1 warning in 1656.51s (0:27:36) ======================
(.env) desibewda@pop-os:/mnt/development/pop-dev-assistant$ 



(.env) desibewda@pop-os:/mnt/development/pop-dev-assistant$ python -m pytest tests/e2e -v --maxfail=5
================================= test session starts =================================
platform linux -- Python 3.12.9, pytest-6.2.5, py-1.11.0, pluggy-1.4.0 -- /mnt/development/pop-dev-assistant/.env/bin/python
cachedir: .pytest_cache
hypothesis profile 'brownie-verbose' -> verbosity=2, deadline=None, max_examples=50, stateful_step_count=10, report_multiple_bugs=False, database=DirectoryBasedExampleDatabase(PosixPath('/home/desibewda/.brownie/hypothesis'))
rootdir: /mnt/development/pop-dev-assistant, configfile: pytest.ini
plugins: mock-3.14.0, web3-6.15.1, anyio-4.9.0, eth-brownie-1.20.6, asyncio-0.18.3, forked-1.6.0, hypothesis-6.27.3, xdist-1.34.0, cov-6.0.0
asyncio: mode=Mode.AUTO
collected 30 items                                                                    
Attached to local RPC client listening at '127.0.0.1:8545'...

tests/e2e/test_ai_assisted_development.py::test_ai_assisted_development PASSED  [  3%]
tests/e2e/test_ai_assisted_development.py::test_ml_model_performance PASSED     [  6%]
tests/e2e/test_chain_setup_basic.py::test_default_networks PASSED               [ 10%]
tests/e2e/test_chain_setup_basic.py::test_bridge_configuration PASSED           [ 13%]
tests/e2e/test_chain_setup_basic.py::test_cross_chain_validation PASSED         [ 16%]
tests/e2e/test_chain_setup_web3.py::test_network_initialization PASSED          [ 20%]
tests/e2e/test_chain_setup_web3.py::test_network_configuration PASSED           [ 23%]
tests/e2e/test_chain_setup_web3.py::test_rpc_validation PASSED                  [ 26%]
tests/e2e/test_chain_setup_web3.py::test_chain_connections PASSED               [ 30%]
tests/e2e/test_chain_setup_web3.py::test_set_network_config PASSED              [ 33%]
tests/e2e/test_complete_workflow.py::test_project_root PASSED                   [ 36%]
tests/e2e/test_complete_workflow.py::test_complete_development_workflow PASSED  [ 40%]
tests/e2e/test_eth_handler.py::test_connection_initialization PASSED            [ 43%]
tests/e2e/test_eth_handler.py::test_network_info PASSED                         [ 46%]
tests/e2e/test_eth_handler.py::test_contract_deployment PASSED                  [ 50%]
tests/e2e/test_eth_handler.py::test_wallet_creation PASSED                      [ 53%]
tests/e2e/test_eth_handler.py::test_network_name_resolution PASSED              [ 56%]
tests/e2e/test_eth_handler.py::test_error_handling PASSED                       [ 60%]
tests/e2e/test_extension_workflow.py::test_complete_extension_workflow PASSED   [ 63%]
tests/e2e/test_infrastructure_gen.py::test_infrastructure_generation PASSED     [ 66%]
tests/e2e/test_infrastructure_gen.py::test_environment_analysis PASSED          [ 70%]
tests/e2e/test_infrastructure_gen.py::test_resource_planning PASSED             [ 73%]
tests/e2e/test_infrastructure_gen.py::test_security_configuration PASSED        [ 76%]
tests/e2e/test_infrastructure_gen.py::test_network_setup PASSED                 [ 80%]
tests/e2e/test_infrastructure_gen.py::test_deployment_planning PASSED           [ 83%]
tests/e2e/test_infrastructure_gen.py::test_resource_optimization PASSED         [ 86%]
tests/e2e/test_infrastructure_gen.py::test_encryption_setup PASSED              [ 90%]
tests/e2e/test_network_config.py::test_network_config_initialization PASSED     [ 93%]
tests/e2e/test_network_config.py::test_network_config_with_custom_urls PASSED   [ 96%]
tests/e2e/test_network_config.py::test_network_config_fallback PASSED           [100%]

================================== warnings summary ===================================
.env/lib/python3.12/site-packages/_pytest/config/__init__.py:1233
  /mnt/development/pop-dev-assistant/.env/lib/python3.12/site-packages/_pytest/config/__init__.py:1233: PytestConfigWarning: Unknown config option: asyncio_default_fixture_loop_scope
  
    self._warn_or_fail_if_strict(f"Unknown config option: {key}\n")

-- Docs: https://docs.pytest.org/en/stable/warnings.html
====================== 30 passed, 1 warning in 124.99s (0:02:04) ======================
(.env) desibewda@pop-os:/mnt/development/pop-dev-assistant$ 




.env) desibewda@pop-os:/mnt/development/pop-dev-assistant$ python -m pytest tests/performance -v --maxfail=5
================================= test session starts =================================
platform linux -- Python 3.12.9, pytest-6.2.5, py-1.11.0, pluggy-1.4.0 -- /mnt/development/pop-dev-assistant/.env/bin/python
cachedir: .pytest_cache
hypothesis profile 'brownie-verbose' -> verbosity=2, deadline=None, max_examples=50, stateful_step_count=10, report_multiple_bugs=False, database=DirectoryBasedExampleDatabase(PosixPath('/home/desibewda/.brownie/hypothesis'))
rootdir: /mnt/development/pop-dev-assistant, configfile: pytest.ini
plugins: mock-3.14.0, web3-6.15.1, anyio-4.9.0, eth-brownie-1.20.6, asyncio-0.18.3, forked-1.6.0, hypothesis-6.27.3, xdist-1.34.0, cov-6.0.0
asyncio: mode=Mode.AUTO
collected 20 items                                                                    
Attached to local RPC client listening at '127.0.0.1:8545'...

tests/performance/test_ai_performance.py::test_ml_model_performance PASSED      [  5%]
tests/performance/test_ai_performance.py::test_decision_engine_performance PASSED [ 10%]
tests/performance/test_ai_performance.py::test_end_to_end_ai_performance PASSED [ 15%]
tests/performance/test_api_latency.py::test_endpoint_latency PASSED             [ 20%]
tests/performance/test_api_latency.py::test_concurrent_api_performance PASSED   [ 25%]
tests/performance/test_api_latency.py::test_ml_model_latency PASSED             [ 30%]
tests/performance/test_api_latency.py::test_api_response_size PASSED            [ 35%]
tests/performance/test_contract_generation.py::test_contract_generation_speed PASSED [ 40%]
tests/performance/test_contract_generation.py::test_concurrent_generation PASSED [ 45%]
tests/performance/test_contract_generation.py::test_ml_optimization_performance PASSED [ 50%]
tests/performance/test_contract_generation.py::test_memory_usage PASSED         [ 55%]
tests/performance/test_project_setup.py::test_project_initialization_speed PASSED [ 60%]
tests/performance/test_project_setup.py::test_dependency_resolution_performance PASSED [ 65%]
tests/performance/test_project_setup.py::test_environment_setup_performance PASSED [ 70%]
tests/performance/test_project_setup.py::test_concurrent_operations PASSED      [ 75%]
tests/performance/test_project_setup.py::test_cleanup PASSED                    [ 80%]
tests/performance/test_security_analysis.py::test_security_analysis_performance PASSED [ 85%]
tests/performance/test_security_analysis.py::test_ml_analysis_performance PASSED [ 90%]
tests/performance/test_security_analysis.py::test_concurrent_security_analysis PASSED [ 95%]
tests/performance/test_security_analysis.py::test_memory_usage_during_analysis PASSED [100%]

================================== warnings summary ===================================
.env/lib/python3.12/site-packages/_pytest/config/__init__.py:1233
  /mnt/development/pop-dev-assistant/.env/lib/python3.12/site-packages/_pytest/config/__init__.py:1233: PytestConfigWarning: Unknown config option: asyncio_default_fixture_loop_scope
  
    self._warn_or_fail_if_strict(f"Unknown config option: {key}\n")

tests/performance/test_api_latency.py::test_endpoint_latency
  /mnt/development/pop-dev-assistant/core_backend/tests/performance/test_api_latency.py:98: RuntimeWarning: coroutine 'CodyAPIClient._make_api_call' was never awaited

tests/performance/test_api_latency.py::test_endpoint_latency
tests/performance/test_api_latency.py::test_concurrent_api_performance
tests/performance/test_api_latency.py::test_api_response_size
  /mnt/development/pop-dev-assistant/.env/lib/python3.12/site-packages/_pytest/python.py:183: RuntimeWarning: coroutine 'CodyAPIClient._make_api_call' was never awaited
    result = testfunction(**testargs)

tests/performance/test_api_latency.py::test_concurrent_api_performance
  /mnt/development/pop-dev-assistant/core_backend/tests/performance/test_api_latency.py:151: RuntimeWarning: coroutine 'CodyAPIClient._make_api_call' was never awaited

tests/performance/test_api_latency.py::test_api_response_size
  /mnt/development/pop-dev-assistant/core_backend/tests/performance/test_api_latency.py:196: RuntimeWarning: coroutine 'CodyAPIClient._make_api_call' was never awaited

tests/performance/test_security_analysis.py::test_concurrent_security_analysis
  /mnt/development/pop-dev-assistant/core_backend/tests/performance/test_security_analysis.py:162: RuntimeWarning: coroutine 'SecurityChecker.analyze_security' was never awaited

tests/performance/test_security_analysis.py::test_concurrent_security_analysis
  /usr/lib/python3.12/asyncio/events.py:88: RuntimeWarning: coroutine 'SecurityChecker.analyze_security' was never awaited
    self._context.run(self._callback, *self._args)

-- Docs: https://docs.pytest.org/en/stable/warnings.html
====================== 20 passed, 9 warnings in 64.27s (0:01:04) ======================
(.env) desibewda@pop-os:/mnt/development/pop-dev-assistant$ 




(.env) desibewda@pop-os:/mnt/development/pop-dev-assistant/vscode-extension$ npm test

> test
> jest

(node:32515) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:32516) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:32522) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
 PASS  tests/mockes/vscode-types.mock.test.ts (6.025 s)
 PASS  tests/suite/index.integration.test.ts (6.168 s)
 PASS  tests/suite/workflow/production/resource/metrics/resource-metrics-analyzer.test.ts
 PASS  tests/suite/llama/performance-tracker.test.ts (6.25 s)
 PASS  tests/suite/llama/connection-manager.test.ts (6.17 s)
 PASS  tests/suite/workflow/production/security/access-controller.test.ts (6.232 s)
 PASS  tests/suite/workflow/build/test/contract-tester.test.ts
 PASS  tests/suite/workflow/production/security/vulnerability-scanner.test.ts (8.249 s)
 PASS  tests/suite/webview/components/features/monitoring/metrics-visualizer.test.tsx
 PASS  tests/suite/webview/components/explorer/explorer-panel.test.tsx
 PASS  tests/suite/llama/hardware-monitor.test.ts
 PASS  tests/suite/commands/base-command.test.ts
 PASS  tests/suite/webview/components/deployment/deployment-panel.test.tsx
 PASS  tests/suite/testHelpers.test.ts
 PASS  tests/suite/workflow/build/test/gas-reporter.test.ts
 PASS  tests/suite/webview/components/network/chain-selector.test.tsx
 PASS  tests/suite/commands/projects/config-command.test.ts
 PASS  tests/suite/workflow/build/monitoring/network-health-monitor.test.ts
 PASS  tests/suite/webview/components/monitoring/Dashboard.test.tsx
 PASS  tests/suite/extension.test.ts
 PASS  tests/suite/workflow/build/pipeline/multi-chain-deployer.test.ts
 PASS  tests/suite/workflow/production/optimization/cache-manager-core.test.ts
 PASS  tests/suite/webview/components/debug/transaction-debugger.test.tsx
 PASS  tests/suite/workflow/production/optimization/cache-storage-manager.test.ts
 PASS  tests/suite/webview/components/network/chain-selector.loading.test.tsx
 PASS  tests/suite/webview/components/features/security/security-checker.test.ts
 PASS  tests/suite/PerformanceMonitor.test.ts
 PASS  tests/suite/commands/contract/deploy-command.test.ts
 PASS  tests/suite/webview/components/common/Controls/CommandButton.test.tsx
 PASS  tests/suite/webview/components/common/Controls/ToggleSwitch.test.tsx
 PASS  tests/suite/webview/components/common/Visualizations/ResourceMonitor.test.tsx
 PASS  tests/suite/webview/components/common/indicators/SystemHealth.test.tsx
 PASS  tests/suite/workflow/build/monitoring/performance-tracker.test.ts
 PASS  tests/suite/webview/components/debug/gas-profiler.test.tsx
 PASS  tests/suite/services/compiler-service.test.ts
 PASS  tests/suite/webview/components/common/indicators/PerformanceMetric.test.tsx
 PASS  tests/suite/workflow/production/resource/monitoring/resource-monitor.test.ts
 PASS  tests/suite/webview/components/features/ai-assist/code-suggestion.test.ts
 PASS  tests/suite/llama/model-loader.test.ts
 PASS  tests/suite/activation/index.test.ts
  ● Console

    console.log
      Starting lifecycle event test

      at Object.<anonymous> (tests/suite/activation/test-cases/activation-services.test.ts:54:17)

    console.log
      Event listener registered

      at Object.<anonymous> (tests/suite/activation/test-cases/activation-services.test.ts:61:17)

    console.log
      Lifecycle event received: { type: 'serviceStarted', service: 'codyService', status: 'success' }

      at EventEmitter.<anonymous> (tests/suite/activation/test-cases/activation-services.test.ts:57:21)

    console.log
      Services started

      at Object.<anonymous> (tests/suite/activation/test-cases/activation-services.test.ts:64:17)

    console.log
      Services retrieved: { codyInitialized: true, dependencies: [ 'metricsService' ] }

      at Object.<anonymous> (tests/suite/activation/test-cases/activation-services.test.ts:67:17)

    console.log
      Spy calls: [
        [
          {
            type: 'serviceStarted',
            service: 'codyService',
            status: 'success'
          }
        ]
      ]

      at Object.<anonymous> (tests/suite/activation/test-cases/activation-services.test.ts:75:17)

    console.log
      Spy results: [ { type: 'return', value: undefined } ]

      at Object.<anonymous> (tests/suite/activation/test-cases/activation-services.test.ts:76:17)

 PASS  tests/suite/webview/styles/theme/styles.test.ts
 PASS  tests/suite/webview/components/common/Visualizations/MetricsChart.test.tsx
 PASS  tests/suite/webview/components/network/ChainConnectionStatus.test.tsx
 PASS  tests/suite/llama/inference-accelerator.test.ts
 PASS  tests/suite/workflow/build/monitoring/network-metrics-collector.test.ts
 PASS  tests/suite/webview/components/layout/CommandCenter.test.tsx
 PASS  tests/suite/webview/components/features/monitoring/alert-system.test.ts
 PASS  tests/suite/llama/llama-engine.test.ts
 PASS  tests/suite/llama/response-processor.test.ts
 PASS  tests/suite/workflow/production/resource/metrics/resource-metrics-collector.test.ts
 PASS  tests/setup/fetch-setup.test.ts
 PASS  tests/suite/webview/components/network/chain-selector.status.test.tsx
 PASS  tests/suite/workflow/production/optimization/cache-backup-handler-operations.test.ts
 PASS  tests/suite/integration/toolchain/language-handler.test.ts
 PASS  tests/suite/services/security-service.test.ts
 PASS  tests/suite/logger/core.test.ts
 PASS  tests/suite/webview/styles/theme/colors.test.ts
 PASS  tests/suite/webview/components/layout/StatusBar.test.tsx
 PASS  tests/mockes/fs.mock.test.ts
 PASS  tests/suite/webview/components/layout/HexGrid.test.tsx
 PASS  tests/suite/webview/components/explorer/contract-viewer.test.tsx
 PASS  tests/suite/metrics-service.test.ts
 PASS  tests/suite/integration/ai/ai-orchestrator-config.test.ts
 PASS  tests/mockes/vscode-api.test.ts
 PASS  tests/suite/CoreModule.test.ts
 PASS  tests/setup/jest.setup.test.ts
 PASS  tests/suite/logger/metrics.test.ts
 PASS  tests/suite/activation/test-cases/activation-cleanup.test.ts
 PASS  tests/suite/integration/toolchain/language-handler-providers.test.ts
 PASS  tests/suite/workflow/production/resource/core/resource-manager-core.test.ts
 PASS  tests/suite/llama/model-optimizer.test.ts
 PASS  tests/suite/webview-manager-panel.test.ts
 PASS  tests/suite/webview/styles/theme/typography.test.ts
 PASS  tests/suite/commands/contract/verify-command.test.ts
 PASS  tests/suite/activation/helpers/setup-helper.test.ts
 PASS  tests/suite/commands/contract/compile-command.test.ts
 PASS  tests/suite/activation/test-cases/activation-init.test.ts
 PASS  tests/suite/logger/index.test.ts
 PASS  tests/suite/activation/helpers/progress-helper.test.ts
 PASS  tests/suite/integration/toolchain/build-system.test.ts
 PASS  tests/suite/workflow/production/optimization/cache-backup-handler-core.test.ts
 PASS  tests/suite/runTest.test.ts
 PASS  tests/suite/llama/prompt-handler.test.ts
 PASS  tests/suite/activation/test-cases/activation-services.test.ts
  ● Console

    console.log
      Starting lifecycle event test

      at Object.<anonymous> (tests/suite/activation/test-cases/activation-services.test.ts:54:17)

    console.log
      Event listener registered

      at Object.<anonymous> (tests/suite/activation/test-cases/activation-services.test.ts:61:17)

    console.log
      Lifecycle event received: { type: 'serviceStarted', service: 'codyService', status: 'success' }

      at EventEmitter.<anonymous> (tests/suite/activation/test-cases/activation-services.test.ts:57:21)

    console.log
      Services started

      at Object.<anonymous> (tests/suite/activation/test-cases/activation-services.test.ts:64:17)

    console.log
      Services retrieved: { codyInitialized: true, dependencies: [ 'metricsService' ] }

      at Object.<anonymous> (tests/suite/activation/test-cases/activation-services.test.ts:67:17)

    console.log
      Spy calls: [
        [
          {
            type: 'serviceStarted',
            service: 'codyService',
            status: 'success'
          }
        ]
      ]

      at Object.<anonymous> (tests/suite/activation/test-cases/activation-services.test.ts:75:17)

    console.log
      Spy results: [ { type: 'return', value: undefined } ]

      at Object.<anonymous> (tests/suite/activation/test-cases/activation-services.test.ts:76:17)

 PASS  tests/suite/activation/test-cases/activation-commands.test.ts
 PASS  tests/suite/config_manager.test.ts
 PASS  tests/mockes/vscode.mock.test.ts
 PASS  tests/suite/commands/CommandPipeline.test.ts
 PASS  tests/suite/integration/ai/ml-engine-connector.test.ts
 PASS  tests/suite/workflow/build/pipeline/contract-builder.test.ts
 PASS  tests/suite/commands/projects/init-command.test.ts
 PASS  tests/suite/integration/ai/ai-orchestrator-bridge.test.ts
 PASS  tests/suite/webview/styles/theme/ThemeElements.test.tsx
 PASS  tests/suite/logger/security.test.ts
 PASS  tests/suite/hardware-config.test.ts
 PASS  tests/suite/activation/test-cases/config-update.test.ts
 PASS  tests/suite/activation/test-cases/activation-config.test.ts
 PASS  tests/suite/services/compiler/contract/code-lens-provider.test.ts
 PASS  tests/suite/index.test.ts

Test Suites: 99 passed, 99 total
Tests:       416 passed, 416 total
Snapshots:   0 total
Time:        27.107 s, estimated 51 s
Ran all test suites.
(.env) desibewda@pop-os:/mnt/development/pop-dev-assistant/vscode-extension$ 








