'use strict';

angular.module('MAGI.controllers', []).
	controller('FormController',['$scope','$location','$anchorScroll','$timeout','filterFilter', 'Application','relationshipCodes','states', function($scope,$location,$anchorScroll,$timeout,filterFilter, Application, relationshipCodes,states){		
                Application.resetResults();
                $scope.submitted = false;
                $scope.applicants = Application.applicants;
                $scope.taxReturns = Application.taxReturns;
                $scope.application = Application;

                $scope.addTaxReturn = Application.addTaxReturn;
                
                $scope.removeApplicant = function(app){
                    $scope.application.removeApplicant(app);
                };

                $scope.removeTaxReturn = Application.removeTaxReturn;
                $scope.relationshipCodes = relationshipCodes;

                $scope.newHousehold = [];

                $scope.exportApplication = function(){
                         $location.path("/exportimport");
                }

                $scope.$watch('newHousehold.length', function(newVal,oldVal){
                    if(newVal > 0){
                        $scope.application.households.push([$scope.newHousehold.pop()]); 
                    }
                });

                $scope.rehouseholdingHappened = function(){
                    return _.map($scope.application.households,
                                          function(hh){return hh.length}).
                                      reduce(function (m, w) {return m + w}, 0) == $scope.applicants.length;

                }
                $scope.$watch('rehouseholdingHappened()', function(newVal, oldVal){
                    if(newVal){
                        $scope.application.cleanHouseholds();
                    }
                });

                $scope.showNewHousehold = function(){
                    return $scope.application.households.length < $scope.applicants.length;
                }

                $scope.showHouseholds = function(){
                    return $scope.applicants.length > 1;
                }

                $scope.checkEligibility = function(){
                         console.log(Application.serialize());

                        if($scope.applicationForm.$valid){
                                Application.checkEligibility().then(function(resp){
                                        $location.path("/results");
                                });
                        } else {
                                $scope.submitted = true;   
                                $timeout(
                                        function(){
                                            angular.element(document.querySelector("input.ng-invalid"))[0].focus( );  
                                });                           
                        }
                }


                $scope.addApplicant = function(){
                        Application.addApplicant("Applicant " + ($scope.applicants.length+1));
                };

                $scope.showFilers = function(){
                        return $scope.applicants.length > 0;
                }

                $scope.showDependents = function(){
                        return $scope.applicants.length > 1;
                }


                // We want to initialize the application with an applicant and a tax return
                if($scope.applicants.length==0){
                        $scope.addApplicant();
                        $scope.addTaxReturn();
                }


		$scope.states = states;
	}]).
        controller('ApplicantController',['$scope',function($scope){
                $scope.checkResponsibility = function(){
                        return $scope.applicant.age <= 19
                };

                $scope.$watch('checkResponsibility()', function(newValue,oldValue){
                        $scope.applicant.nonParentResponsibility = false;
                });

                $scope.$watch('applicant.pregnantThreeMonths', function(newValue,oldValue){
                        if(newValue){
                                $scope.applicant.pregnant = false;
                        }
                });

                $scope.$watch('applicant.pregnant', function(newValue,oldValue){
                        if(newValue){
                                $scope.applicant.pregnantThreeMonths = false;
                        }
                }); 

                $scope.updateRelationship = function(relationship){
                        relationship.updateOpposite();
                }

                $scope.updateMonthly = function(applicant){
                  applicant.updateMonthly();
                }

                $scope.updateWages = function(applicant){
                  applicant.updateWages();
                }

                $scope.notMe = function(other) {
                        return other !== $scope.applicant; 
                } 
        }]).
        controller('ResultsController',['$scope','$location','Application', function($scope,$location,Application){
                $scope.households = Application.determination['Medicaid Households'];
                $scope.expandByDefault = function(){
                        return $scope.households.length == 1 && $scope.households.Applicants.length == 1;
                }

                $scope.exportApplication = function(){
                         $location.path("/exportimport");
                }


                $scope.returnToForm = function(){
                        $location.path("/application");
                }
        }]).
        controller('ExportImportController',['$scope','$location','Application', function($scope,$location,Application){
                $scope.applicationJson = angular.toJson(Application.serialize(), true);
                $scope.resultsJson = angular.toJson(Application.determination, true);

                $scope.showResults = Object.keys(Application.determination).length > 0;

                $scope.importApplication = function(){
                        // Note - may want to wrap this in a try/catch loop of some sort
                        var application = angular.fromJson($scope.applicationJson);
                        console.log(application);
                        Application.deserialize(application);
                        // Redirect to application
                        $location.path("/application");
                }

                $scope.returnToForm = function(){
                        $location.path("/application");
                }
        }]);
